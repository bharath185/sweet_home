'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MousePointer,
  Hand,
  Square,
  Maximize2,
  Trash2,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Magnet,
  Move,
  AlertTriangle,
  Building,
  Ruler,
  Type,
  ImageIcon,
  Palette,
  Lock,
  Unlock,
  Copy,
  Compass,
  Sparkles,
  Layers,
  Sliders,
  Check,
  CornerDownRight,
  Maximize,
  Minimize,
  Undo2,
  Redo2
} from 'lucide-react';
import { HomePlan, Wall, FurnitureItem, Room, DimensionLine, TextNote } from '../types/plan';
import { formatDistance, formatArea } from '../services/unitConverter';
import { isTabletopItem, autoAttachToTabletop } from '../services/tabletopAttachment';

interface PlanCanvas2DProps {
  plan: HomePlan;
  onUpdatePlan: (updated: HomePlan) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  activeFloor?: number;
  onFloorChange?: (floor: number) => void;
  collidingItemIds?: Set<string>;
  collisionReasons?: Map<string, string>;
  onOpenBlueprintModal?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  floorMode?: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange?: (mode: 'single' | 'sideBySide' | 'stacked') => void;
}

type ToolMode = 'select' | 'drawWall' | 'dimension' | 'text' | 'pan';
type FurnitureHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'rotate' | 'body' | null;
type WallHandle = 'start' | 'end' | 'body' | null;

export const DESIGNER_PALETTES = [
  { name: 'Scandinavian Oak', color: '#e0d8c3' },
  { name: 'Warm Walnut', color: '#5c4033' },
  { name: 'Japandi Charcoal', color: '#27272a' },
  { name: 'Ivory Bouclé', color: '#f5f5f4' },
  { name: 'Emerald Velvet', color: '#065f46' },
  { name: 'French Navy', color: '#1e3a8a' },
  { name: 'Terracotta Clay', color: '#c2410c' },
  { name: 'Coastal Sage', color: '#84a98c' },
  { name: 'Ochre Gold', color: '#d97706' },
];

export const WALL_FINISHES = [
  { name: 'Crisp White', color: '#f8fafc' },
  { name: 'Warm Greige', color: '#e7e5e4' },
  { name: 'Modern Slate', color: '#334155' },
  { name: 'Exposed Brick', color: '#991b1b' },
  { name: 'Sage Accent', color: '#166534' },
];

export const PlanCanvas2D: React.FC<PlanCanvas2DProps> = ({
  plan,
  onUpdatePlan,
  selectedId,
  onSelectId,
  activeFloor = 0,
  onFloorChange,
  collidingItemIds = new Set(),
  collisionReasons = new Map(),
  onOpenBlueprintModal,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  floorMode,
  onFloorModeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blueprintImgRef = useRef<HTMLImageElement | null>(null);

  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [scale, setScale] = useState<number>(0.8);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Global Keyboard Shortcuts (Space for Pan, H for Hand, V for Select, W for Wall, D for Dim, T for Text)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.code === 'KeyH') {
        setToolMode('pan');
        onSelectId(null);
        setWallStart(null);
        setDimStart(null);
      } else if (e.code === 'KeyV') {
        setToolMode('select');
      } else if (e.code === 'KeyW') {
        setToolMode('drawWall');
      } else if (e.code === 'KeyD') {
        setToolMode('dimension');
      } else if (e.code === 'KeyT') {
        setToolMode('text');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSelectId]);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [dimStart, setDimStart] = useState<{ x: number; y: number } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Dragging State
  const [activeFurnitureHandle, setActiveFurnitureHandle] = useState<FurnitureHandle>(null);
  const [activeWallHandle, setActiveWallHandle] = useState<WallHandle>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialFurnitureState, setInitialFurnitureState] = useState<FurnitureItem | null>(null);
  const [initialWallState, setInitialWallState] = useState<Wall | null>(null);
  const [magneticSnapPoint, setMagneticSnapPoint] = useState<{ x: number; y: number } | null>(null);

  // Snapping
  const [snapToGrid, setSnapToGrid] = useState<boolean>(plan.preferences?.magnetismEnabled ?? true);
  const GRID_SIZE_CM = plan.preferences?.gridSize || 20;
  const unit = plan.preferences?.unitSystem || 'cm';

  // Load blueprint image if available
  useEffect(() => {
    if (plan.blueprint?.url && plan.blueprint?.isVisible) {
      const img = new Image();
      img.src = plan.blueprint.url;
      img.onload = () => {
        blueprintImgRef.current = img;
      };
    } else {
      blueprintImgRef.current = null;
    }
  }, [plan.blueprint?.url, plan.blueprint?.isVisible]);

  // Multi-Floor Canvas Mode: 'single' (Focus on active floor) | 'sideBySide' (Show Floor 1 & Floor 2 side-by-side)
  const [localFloorMode, setLocalFloorMode] = useState<'single' | 'sideBySide' | 'stacked'>('single');
  const canvasFloorMode: 'single' | 'sideBySide' | 'stacked' = floorMode || localFloorMode;
  const setCanvasFloorMode = (newMode: 'single' | 'sideBySide' | 'stacked' | ((prev: 'single' | 'sideBySide' | 'stacked') => 'single' | 'sideBySide' | 'stacked')) => {
    const resolved = typeof newMode === 'function' ? newMode(canvasFloorMode) : newMode;
    setLocalFloorMode(resolved);
    if (onFloorModeChange) onFloorModeChange(resolved);
  };
  const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
    { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
    { level: 1, name: '1st Floor', height: 250, elevation: 250 },
  ];

  const FLOOR_SPACING_CM = 900;
  const getFloorOffset = useCallback(
    (lvl: number = 0) => {
      if (canvasFloorMode === 'single') return { x: 0, y: 0 };
      const floorIdx = allFloors.findIndex((fl) => fl.level === lvl);
      const validIdx = floorIdx >= 0 ? floorIdx : 0;
      const mid = (allFloors.length - 1) / 2;
      return { x: (validIdx - mid) * FLOOR_SPACING_CM, y: 0 };
    },
    [canvasFloorMode, allFloors]
  );

  // Convert Screen pixel coordinates to Plan (cm) coordinates
  const screenToPlan = useCallback(
    (clientX: number, clientY: number, bypassSnap: boolean = false) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 + panOffset.x;
      const centerY = rect.height / 2 + panOffset.y;

      let rawX = (clientX - rect.left - centerX) / scale;
      let rawY = (clientY - rect.top - centerY) / scale;

      // In side-by-side mode, subtract the active floor offset
      if (canvasFloorMode === 'sideBySide') {
        const offset = getFloorOffset(activeFloor);
        rawX -= offset.x;
        rawY -= offset.y;
      }

      let x = rawX;
      let y = rawY;

      if (snapToGrid && !bypassSnap) {
        x = Math.round(x / GRID_SIZE_CM) * GRID_SIZE_CM;
        y = Math.round(y / GRID_SIZE_CM) * GRID_SIZE_CM;
      }

      return { x, y };
    },
    [scale, panOffset, snapToGrid, GRID_SIZE_CM, canvasFloorMode, activeFloor, getFloorOffset]
  );

  // Convert Plan (cm) coordinates to Screen pixel coordinates (with optional floor level offset)
  const planToScreen = useCallback(
    (x: number, y: number, floorLvl?: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 + panOffset.x;
      const centerY = rect.height / 2 + panOffset.y;
      const offset = floorLvl !== undefined ? getFloorOffset(floorLvl) : { x: 0, y: 0 };

      return {
        x: centerX + (x + offset.x) * scale,
        y: centerY + (y + offset.y) * scale,
      };
    },
    [scale, panOffset, getFloorOffset]
  );

  // Filter items for current floor
  const floorWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
  const floorFurniture = plan.furniture.filter(
    (f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false
  );
  const floorRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
  const floorDimensionLines = (plan.dimensionLines || []).filter(
    (d) => (d.floorLevel ?? 0) === activeFloor
  );
  const floorTextNotes = (plan.textNotes || []).filter(
    (t) => (t.floorLevel ?? 0) === activeFloor
  );

  const selectedFurniture = floorFurniture.find((f) => f.id === selectedId);
  const selectedWall = floorWalls.find((w) => w.id === selectedId);

  // Helper to find magnetic snap vertex from other walls
  const findSnapVertex = useCallback(
    (targetX: number, targetY: number, excludeWallId?: string) => {
      const SNAP_THRESHOLD_CM = 25;
      let closestPt: { x: number; y: number } | null = null;
      let minDistance = SNAP_THRESHOLD_CM;

      floorWalls.forEach((w) => {
        if (w.id === excludeWallId) return;
        const d1 = Math.hypot(w.xStart - targetX, w.yStart - targetY);
        if (d1 < minDistance) {
          minDistance = d1;
          closestPt = { x: w.xStart, y: w.yStart };
        }
        const d2 = Math.hypot(w.xEnd - targetX, w.yEnd - targetY);
        if (d2 < minDistance) {
          minDistance = d2;
          closestPt = { x: w.xEnd, y: w.yEnd };
        }
      });

      return closestPt;
    },
    [floorWalls]
  );

  // Keyboard Shortcuts (Scale, Rotate, Delete, Duplicate, Lock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          handleDeleteSelected();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedFurniture) {
          const newAngle = ((selectedFurniture.angle || 0) + Math.PI / 4) % (Math.PI * 2);
          updateFurniture({ angle: newAngle });
        }
      } else if (e.key === '+' || e.key === '=' || e.key === ']') {
        if (selectedFurniture) handleScaleSelected(1.1);
      } else if (e.key === '-' || e.key === '_' || e.key === '[') {
        if (selectedFurniture) handleScaleSelected(0.9);
      } else if (e.key === 'Escape') {
        onSelectId(null);
        setWallStart(null);
        setDimStart(null);
      } else if (e.key === 'l' || e.key === 'L') {
        if (selectedFurniture) {
          updateFurniture({ isLocked: !selectedFurniture.isLocked });
        }
      } else if (e.key === 'd' || e.key === 'D') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleDuplicateSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedFurniture, selectedWall, plan]);

  // Main 2D Drawing Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Blueprint Background Image if loaded
    if (blueprintImgRef.current && plan.blueprint?.isVisible) {
      ctx.save();
      ctx.globalAlpha = plan.blueprint.opacity || 0.4;
      const bpWidth = plan.blueprint.width * scale;
      const bpHeight = plan.blueprint.height * scale;
      const bpPos = planToScreen(
        plan.blueprint.x - plan.blueprint.width / 2,
        plan.blueprint.y - plan.blueprint.height / 2
      );
      ctx.drawImage(blueprintImgRef.current, bpPos.x, bpPos.y, bpWidth, bpHeight);
      ctx.restore();
    }

    // 2. Draw CAD Grid Lines
    const gridPx = GRID_SIZE_CM * scale;
    const centerX = width / 2 + panOffset.x;
    const centerY = height / 2 + panOffset.y;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    const startX = centerX % gridPx;
    const startY = centerY % gridPx;

    ctx.beginPath();
    for (let x = startX; x < width; x += gridPx) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += gridPx) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 1-Meter Major Grid
    const majorGridPx = 100 * scale;
    const majorStartX = centerX % majorGridPx;
    const majorStartY = centerY % majorGridPx;

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = majorStartX; x < width; x += majorGridPx) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = majorStartY; y < height; y += majorGridPx) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Origin Axes
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Multi-Floor Drawing Loop (Single Floor vs Side-by-Side)
    const floorsToRender = canvasFloorMode === 'sideBySide' ? allFloors : [{ level: activeFloor, name: 'Active Floor', height: 250, elevation: 0 }];

    // If Side-by-Side mode, draw architectural floor boundary plates
    if (canvasFloorMode === 'sideBySide') {
      allFloors.forEach((fl) => {
        const isCurActive = activeFloor === fl.level;
        const boxW = 820 * scale;
        const boxH = 680 * scale;
        const centerScreen = planToScreen(0, 0, fl.level);

        ctx.save();
        // Floor plate boundary
        ctx.fillStyle = isCurActive ? 'rgba(2, 132, 199, 0.02)' : 'rgba(241, 245, 249, 0.4)';
        ctx.fillRect(centerScreen.x - boxW / 2, centerScreen.y - boxH / 2, boxW, boxH);

        ctx.strokeStyle = isCurActive ? '#0284c7' : '#cbd5e1';
        ctx.lineWidth = isCurActive ? 2 : 1;
        ctx.setLineDash(isCurActive ? [] : [6, 4]);
        ctx.strokeRect(centerScreen.x - boxW / 2, centerScreen.y - boxH / 2, boxW, boxH);

        // Floor Header Tag
        ctx.setLineDash([]);
        ctx.fillStyle = isCurActive ? '#0284c7' : '#475569';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `LEVEL ${fl.level}: ${fl.name.toUpperCase()} (Height: ${fl.height || 250}cm)`,
          centerScreen.x,
          centerScreen.y - boxH / 2 - 12
        );

        // Active Floor Indicator
        if (isCurActive) {
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillText('● ACTIVE SELECTED FLOOR', centerScreen.x, centerScreen.y - boxH / 2 + 16);
        }
        ctx.restore();
      });
    }

    floorsToRender.forEach((currentFloorObj) => {
      const flLevel = currentFloorObj.level;
      const curRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === flLevel);
      const curWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === flLevel);
      const curFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === flLevel && f.isVisible !== false);
      const curDimensions = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === flLevel);
      const curNotes = (plan.textNotes || []).filter((t) => (t.floorLevel ?? 0) === flLevel);

      // 3. Draw Rooms
      curRooms.forEach((room) => {
        if (room.points.length < 3) return;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.06)';
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        const p0 = planToScreen(room.points[0].x, room.points[0].y, flLevel);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < room.points.length; i++) {
          const p = planToScreen(room.points[i].x, room.points[i].y, flLevel);
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const avgX = room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length;
        const avgY = room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length;
        const screenAvg = planToScreen(avgX, avgY, flLevel);

        ctx.font = '600 12px system-ui, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, screenAvg.x, screenAvg.y - 8);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(formatArea(room.areaSquareMeters || 12.5, unit), screenAvg.x, screenAvg.y + 8);
      });

      // 4. Draw Walls
      curWalls.forEach((wall) => {
        const p1 = planToScreen(wall.xStart, wall.yStart, flLevel);
        const p2 = planToScreen(wall.xEnd, wall.yEnd, flLevel);
        const isSelected = selectedId === wall.id;

        ctx.save();
        ctx.strokeStyle = isSelected ? '#38bdf8' : wall.color || '#e2e8f0';
        ctx.lineWidth = Math.max(3, wall.thickness * scale);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.strokeStyle = isSelected ? '#0284c7' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();

        const lengthCm = Math.round(
          Math.hypot(wall.xEnd - wall.xStart, wall.yEnd - wall.yStart)
        );
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(formatDistance(lengthCm, unit), midX, midY - 8);

        if (isSelected) {
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });

      // 6. Draw Dimension Lines
      curDimensions.forEach((dim) => {
        const p1 = planToScreen(dim.xStart, dim.yStart, flLevel);
        const p2 = planToScreen(dim.xEnd, dim.yEnd, flLevel);
        const dist = Math.hypot(dim.xEnd - dim.xStart, dim.yEnd - dim.yStart);

        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
        ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dim.text || formatDistance(dist, unit), (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 6);
        ctx.restore();
      });

      // 8. Draw Contractor Text Notes
      curNotes.forEach((note) => {
        const p = planToScreen(note.x, note.y, flLevel);
        ctx.save();
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = note.color || '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(`📌 ${note.text}`, p.x, p.y);
        ctx.restore();
      });

      // 9. Draw Furniture & Ceiling Items
      curFurniture.forEach((item) => {
        const pos = planToScreen(item.x, item.y, flLevel);
        const isSelected = selectedId === item.id;
        const isColliding = collidingItemIds.has(item.id);
        const isLocked = item.isLocked;
        const isCeiling =
    item.placementType === 'ceiling' ||
    (item.category || '').toLowerCase().includes('ceiling') ||
    (item.name || '').toLowerCase().includes('pendant') ||
    (item.name || '').toLowerCase().includes('chandelier') ||
    (item.name || '').toLowerCase().includes('ceiling fan') ||
    (item.name || '').toLowerCase().includes('downlight') ||
    (item.name || '').toLowerCase().includes('flush');
        const w = item.width * scale;
        const d = item.depth * scale;
        const cat = (item.category || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(item.angle || 0);

        if (isColliding) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 16;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 2]);
        } else {
          ctx.fillStyle = item.color
            ? item.color + (isSelected ? 'dd' : 'ff')
            : isSelected
            ? 'rgba(14, 165, 233, 0.35)'
            : isCeiling
            ? 'rgba(245, 158, 11, 0.25)'
            : cat.includes('door') || cat.includes('window')
            ? 'rgba(234, 179, 8, 0.45)'
            : '#e2e8f0';

          ctx.strokeStyle = isSelected
            ? '#0284c7'
            : isCeiling
            ? '#d97706'
            : cat.includes('door') || cat.includes('window')
            ? '#d97706'
            : '#64748b';

          ctx.lineWidth = isSelected ? 2.5 : 1.5;
        }

        ctx.fillRect(-w / 2, -d / 2, w, d);
        ctx.strokeRect(-w / 2, -d / 2, w, d);

        ctx.save();
        ctx.strokeStyle = isColliding ? '#ef4444' : isSelected ? '#0284c7' : '#64748b';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);

        if (cat.includes('sofa') || cat.includes('living') || itemName.includes('sofa') || itemName.includes('chair')) {
          const armW = Math.min(w * 0.15, 12);
          const backD = Math.min(d * 0.2, 14);
          ctx.strokeRect(-w / 2, -d / 2, armW, d);
          ctx.strokeRect(w / 2 - armW, -d / 2, armW, d);
          ctx.strokeRect(-w / 2 + armW, -d / 2, w - 2 * armW, backD);
        } else if (cat.includes('bed') || itemName.includes('bed')) {
          const pillowW = Math.min(w * 0.35, 24);
          const pillowD = Math.min(d * 0.2, 16);
          ctx.strokeRect(-w / 2 + 4, -d / 2 + 4, pillowW, pillowD);
          ctx.strokeRect(w / 2 - 4 - pillowW, -d / 2 + 4, pillowW, pillowD);
          ctx.beginPath();
          ctx.moveTo(-w / 2, d * 0.1);
          ctx.lineTo(w / 2, d * 0.1);
          ctx.stroke();
        } else if (cat.includes('door') || itemName.includes('door')) {
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.4;
          if (itemName.includes('sliding') || itemName.includes('barn')) {
            // Sliding door arrow indicator
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w / 2 - 8, -4);
            ctx.lineTo(w / 2, 0);
            ctx.lineTo(w / 2 - 8, 4);
            ctx.stroke();
          } else {
            // Standard / Arched / French swing arc
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(-w / 2, d / 2, w, -Math.PI / 2, 0);
            ctx.stroke();
          }
        } else if (cat.includes('window') || itemName.includes('window')) {
          // Architectural Window symbol (Triple-glazing lines + sill)
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-w / 2, -d * 0.25);
          ctx.lineTo(w / 2, -d * 0.25);
          ctx.moveTo(-w / 2, 0);
          ctx.lineTo(w / 2, 0);
          ctx.moveTo(-w / 2, d * 0.25);
          ctx.lineTo(w / 2, d * 0.25);
          ctx.stroke();
        } else if (cat.includes('shelf') || itemName.includes('shelf')) {
          // Wall Shelf symbol with mounting bracket indicators
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-w / 2 + 2, -d / 2 + 2, w - 4, d - 4);
          ctx.beginPath();
          ctx.moveTo(-w * 0.35, -d / 2);
          ctx.lineTo(-w * 0.35, d / 2);
          ctx.moveTo(w * 0.35, -d / 2);
          ctx.lineTo(w * 0.35, d / 2);
          ctx.stroke();
        } else if (cat.includes('wall') || itemName.includes('slat') || itemName.includes('wainscot') || itemName.includes('marble') || itemName.includes('brick')) {
          // Accent Wall Slat / Panel symbol (Hatched lines)
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 1;
          const step = Math.max(6, w / 10);
          for (let sx = -w / 2 + step; sx < w / 2; sx += step) {
            ctx.beginPath();
            ctx.moveTo(sx, -d / 2);
            ctx.lineTo(sx, d / 2);
            ctx.stroke();
          }
        } else if (itemName.includes('rug') || itemName.includes('carpet')) {
          // Rug dashed border + fringe
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(-w / 2 + 3, -d / 2 + 3, w - 6, d - 6);
        } else if (itemName.includes('curtain') || itemName.includes('drape')) {
          // Curtains wave pleats
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let cx = -w / 2; cx <= w / 2; cx += 8) {
            ctx.arc(cx, 0, 4, 0, Math.PI);
          }
          ctx.stroke();
        } else if (itemName.includes('mirror') || itemName.includes('art') || itemName.includes('canvas')) {
          // Mirror / Frame tick
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-w / 2 + 2, -d / 2 + 2, w - 4, d - 4);
        } else if (cat.includes('plant') || itemName.includes('plant')) {
          // Foliage flower / leaves
          ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(w, d) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (cat.includes('light') || itemName.includes('light') || itemName.includes('lamp') || isCeiling) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(w, d), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Orientation marker
        ctx.strokeStyle = isColliding ? '#ef4444' : isSelected ? '#0284c7' : '#64748b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -d / 2 + 4);
        ctx.stroke();

        if (scale > 0.4) {
          ctx.font = isColliding ? 'bold 10px system-ui' : 'bold 10px system-ui, sans-serif';
          ctx.fillStyle = isColliding ? '#991b1b' : isSelected ? '#0369a1' : '#1e293b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.name, 0, 0);
        }

        if (isColliding) {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(w / 2 - 4, -d / 2 + 4, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('!', w / 2 - 4, -d / 2 + 4);
        }

        if (isTabletopItem(item)) {
          ctx.save();
          const isOnTable = (item.elevation || 0) > 0;
          ctx.fillStyle = isOnTable ? 'rgba(2, 132, 199, 0.9)' : 'rgba(220, 38, 38, 0.9)';
          ctx.font = 'bold 8px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            isOnTable ? `▲ TABLETOP (+${Math.round(item.elevation || 0)}cm)` : '⚠️ RESTRICTED (NEEDS TABLE)',
            0,
            d / 2 + 12
          );
          ctx.restore();
        }

        if (isCeiling) {
          ctx.save();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(w, d) / 2 + 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(217, 119, 6, 0.95)';
          ctx.font = 'bold 8px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `▼ CEILING (${Math.round(item.elevation || 220)}cm)`,
            0,
            d / 2 + (isTabletopItem(item) ? 22 : 12)
          );
          ctx.restore();
        }

        if (isLocked) {
          ctx.fillStyle = '#d97706';
          ctx.font = '10px system-ui';
          ctx.fillText('🔒', -w / 2 + 10, -d / 2 + 10);
        }

        // Handles
        if (isSelected && !isLocked) {
          const handleDist = d / 2 + 20;
          ctx.strokeStyle = isColliding ? '#ef4444' : '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -d / 2);
          ctx.lineTo(0, -handleDist);
          ctx.stroke();

          ctx.fillStyle = isColliding ? '#ef4444' : '#0284c7';
          ctx.beginPath();
          ctx.arc(0, -handleDist, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const handles: [number, number][] = [
            [-w / 2, -d / 2],
            [0, -d / 2],
            [w / 2, -d / 2],
            [w / 2, 0],
            [w / 2, d / 2],
            [0, d / 2],
            [-w / 2, d / 2],
            [-w / 2, 0],
          ];

          handles.forEach(([hx, hy]) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = isColliding ? '#ef4444' : '#0284c7';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(hx - 4, hy - 4, 8, 8);
            ctx.fill();
            ctx.stroke();
          });
        }

        ctx.restore();
      });
    });

    // 10. Magnetic Snap Beacon Indicator
    if (magneticSnapPoint) {
      const snapScreen = planToScreen(magneticSnapPoint.x, magneticSnapPoint.y);
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(snapScreen.x, snapScreen.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SNAP ◎', snapScreen.x, snapScreen.y - 18);
      ctx.restore();
    }

    // 11. North Compass Rose (Architectural CAD Style)
    const compassX = 35;
    const compassY = height - 55;
    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // North arrow
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fill();

    // South arrow
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(-6, 0);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -6);
    ctx.restore();

    // 12. Graphic Scale Bar (Bottom Left)
    const scaleBarX = 20;
    const scaleBarY = height - 20;
    const oneMeterPx = 100 * scale;
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + oneMeterPx, scaleBarY);
    ctx.moveTo(scaleBarX, scaleBarY - 4);
    ctx.lineTo(scaleBarX, scaleBarY + 4);
    ctx.moveTo(scaleBarX + oneMeterPx, scaleBarY - 4);
    ctx.lineTo(scaleBarX + oneMeterPx, scaleBarY + 4);
    ctx.stroke();

    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', scaleBarX, scaleBarY - 6);
    ctx.fillText(formatDistance(100, unit), scaleBarX + oneMeterPx, scaleBarY - 6);
    ctx.restore();
  }, [
    plan,
    scale,
    panOffset,
    selectedId,
    toolMode,
    wallStart,
    dimStart,
    mouseCanvasPos,
    planToScreen,
    floorWalls,
    floorFurniture,
    floorRooms,
    floorDimensionLines,
    floorTextNotes,
    collidingItemIds,
    magneticSnapPoint,
    unit,
  ]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Hand / Pan Tool or Middle Mouse or Spacebar or Alt: Strictly adjust position, NEVER select items
    if (e.button === 1 || toolMode === 'pan' || isSpacePressed || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      // Deselect to keep view clean during pan
      if (selectedId) onSelectId(null);
      return;
    }

    const clickPlan = screenToPlan(e.clientX, e.clientY);

    // Wall Tool
    if (toolMode === 'drawWall') {
      const snapPt = findSnapVertex(clickPlan.x, clickPlan.y);
      const effectivePt = snapPt || clickPlan;

      if (!wallStart) {
        setWallStart(effectivePt);
      } else {
        const newWall: Wall = {
          id: `wall_${Date.now()}`,
          xStart: wallStart.x,
          yStart: wallStart.y,
          xEnd: effectivePt.x,
          yEnd: effectivePt.y,
          thickness: plan.preferences?.defaultWallThickness || 15,
          height: plan.preferences?.defaultWallHeight || 250,
          color: '#f8fafc',
          floorLevel: activeFloor,
        };
        onUpdatePlan({
          ...plan,
          walls: [...plan.walls, newWall],
          updatedAt: new Date().toISOString(),
        });
        setWallStart(effectivePt);
      }
      return;
    }

    // Dimension Tool
    if (toolMode === 'dimension') {
      if (!dimStart) {
        setDimStart(clickPlan);
      } else {
        const newDim: DimensionLine = {
          id: `dim_${Date.now()}`,
          xStart: dimStart.x,
          yStart: dimStart.y,
          xEnd: clickPlan.x,
          yEnd: clickPlan.y,
          offset: 20,
          floorLevel: activeFloor,
        };
        onUpdatePlan({
          ...plan,
          dimensionLines: [...(plan.dimensionLines || []), newDim],
          updatedAt: new Date().toISOString(),
        });
        setDimStart(null);
      }
      return;
    }

    // Text Note Tool
    if (toolMode === 'text') {
      const text = prompt('Enter text note / contractor instruction:');
      if (text && text.trim()) {
        const newNote: TextNote = {
          id: `note_${Date.now()}`,
          x: clickPlan.x,
          y: clickPlan.y,
          text: text.trim(),
          floorLevel: activeFloor,
        };
        onUpdatePlan({
          ...plan,
          textNotes: [...(plan.textNotes || []), newNote],
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    // Select Tool Hit Testing
    if (toolMode === 'select') {
      // 1. Check if clicked on Selected Furniture Handles
      if (selectedFurniture && !selectedFurniture.isLocked) {
        const item = selectedFurniture;
        const screenPos = planToScreen(item.x, item.y);
        const rect = canvasRef.current!.getBoundingClientRect();
        const clickScreenX = e.clientX - rect.left;
        const clickScreenY = e.clientY - rect.top;

        const w = item.width * scale;
        const d = item.depth * scale;
        const angle = item.angle || 0;

        // Transform mouse point into furniture's local space
        const dx = clickScreenX - screenPos.x;
        const dy = clickScreenY - screenPos.y;
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Check Rotation Handle
        const rotHandleDist = d / 2 + 20;
        if (Math.hypot(localX - 0, localY - (-rotHandleDist)) <= 12) {
          setActiveFurnitureHandle('rotate');
          setDragStartPos(clickPlan);
          setInitialFurnitureState({ ...item });
          return;
        }

        // Check 8 Resize Handles
        const handles: { handle: FurnitureHandle; x: number; y: number }[] = [
          { handle: 'nw', x: -w / 2, y: -d / 2 },
          { handle: 'n', x: 0, y: -d / 2 },
          { handle: 'ne', x: w / 2, y: -d / 2 },
          { handle: 'e', x: w / 2, y: 0 },
          { handle: 'se', x: w / 2, y: d / 2 },
          { handle: 's', x: 0, y: d / 2 },
          { handle: 'sw', x: -w / 2, y: d / 2 },
          { handle: 'w', x: -w / 2, y: 0 },
        ];

        for (const h of handles) {
          if (Math.hypot(localX - h.x, localY - h.y) <= 10) {
            setActiveFurnitureHandle(h.handle);
            setDragStartPos(clickPlan);
            setInitialFurnitureState({ ...item });
            return;
          }
        }
      }

      // 2. Check if clicked on Selected Wall Handles
      if (selectedWall) {
        const p1 = planToScreen(selectedWall.xStart, selectedWall.yStart);
        const p2 = planToScreen(selectedWall.xEnd, selectedWall.yEnd);
        const rect = canvasRef.current!.getBoundingClientRect();
        const clickScreenX = e.clientX - rect.left;
        const clickScreenY = e.clientY - rect.top;

        if (Math.hypot(clickScreenX - p1.x, clickScreenY - p1.y) <= 14) {
          setActiveWallHandle('start');
          setDragStartPos(clickPlan);
          setInitialWallState({ ...selectedWall });
          return;
        }
        if (Math.hypot(clickScreenX - p2.x, clickScreenY - p2.y) <= 14) {
          setActiveWallHandle('end');
          setDragStartPos(clickPlan);
          setInitialWallState({ ...selectedWall });
          return;
        }
      }

      // 3. Hit Test Furniture Items
      let foundFurniture: FurnitureItem | null = null;
      for (let i = floorFurniture.length - 1; i >= 0; i--) {
        const f = floorFurniture[i];
        const halfW = f.width / 2;
        const halfD = f.depth / 2;
        const dx = clickPlan.x - f.x;
        const dy = clickPlan.y - f.y;
        const cos = Math.cos(-(f.angle || 0));
        const sin = Math.sin(-(f.angle || 0));
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfD) {
          foundFurniture = f;
          break;
        }
      }

      if (foundFurniture) {
        onSelectId(foundFurniture.id);
        if (!foundFurniture.isLocked) {
          setActiveFurnitureHandle('body');
          setDragStartPos(clickPlan);
          setInitialFurnitureState({ ...foundFurniture });
        }
        return;
      }

      // 4. Hit Test Walls
      let foundWall: Wall | null = null;
      for (const w of floorWalls) {
        const dist = pointToSegmentDistance(
          clickPlan.x,
          clickPlan.y,
          w.xStart,
          w.yStart,
          w.xEnd,
          w.yEnd
        );
        if (dist <= w.thickness / 2 + 10) {
          foundWall = w;
          break;
        }
      }

      if (foundWall) {
        onSelectId(foundWall.id);
        setActiveWallHandle('body');
        setDragStartPos(clickPlan);
        setInitialWallState({ ...foundWall });
        return;
      }

      // Clicked on empty space: deselect
      onSelectId(null);
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPlan = screenToPlan(e.clientX, e.clientY);
    setMouseCanvasPos(currentPlan);

    // Dynamic magnetic snap preview during wall drawing or dragging
    if (toolMode === 'drawWall' || (activeWallHandle && ['start', 'end'].includes(activeWallHandle))) {
      const snapPt = findSnapVertex(currentPlan.x, currentPlan.y, selectedWall?.id);
      setMagneticSnapPoint(snapPt);
    } else {
      if (magneticSnapPoint) setMagneticSnapPoint(null);
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Handle Dragging Furniture
    if (activeFurnitureHandle && initialFurnitureState && selectedFurniture) {
      if (activeFurnitureHandle === 'body') {
        const dx = currentPlan.x - dragStartPos.x;
        const dy = currentPlan.y - dragStartPos.y;
        const newX = initialFurnitureState.x + dx;
        const newY = initialFurnitureState.y + dy;

        if (isTabletopItem(selectedFurniture)) {
          const simulatedItem = {
            ...selectedFurniture,
            x: newX,
            y: newY,
            floorLevel: activeFloor,
          };
          const attach = autoAttachToTabletop(simulatedItem, plan.furniture);
          updateFurniture({
            x: newX,
            y: newY,
            elevation: attach.targetElevation,
            hostFurnitureId: attach.host ? attach.host.id : undefined,
          });
        } else {
          updateFurniture({
            x: newX,
            y: newY,
          });
        }
        return;
      }

      if (activeFurnitureHandle === 'rotate') {
        const angle = Math.atan2(
          currentPlan.x - initialFurnitureState.x,
          -(currentPlan.y - initialFurnitureState.y)
        );
        updateFurniture({ angle });
        return;
      }

      // Handle Resize handles (NW, N, NE, E, SE, S, SW, W)
      const angle = initialFurnitureState.angle || 0;
      const dx = currentPlan.x - dragStartPos.x;
      const dy = currentPlan.y - dragStartPos.y;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      const localDx = dx * cos - dy * sin;
      const localDy = dx * sin + dy * cos;

      let newWidth = initialFurnitureState.width;
      let newDepth = initialFurnitureState.depth;

      if (['e', 'ne', 'se'].includes(activeFurnitureHandle)) {
        newWidth = Math.max(15, Math.round(initialFurnitureState.width + localDx * 2));
      } else if (['w', 'nw', 'sw'].includes(activeFurnitureHandle)) {
        newWidth = Math.max(15, Math.round(initialFurnitureState.width - localDx * 2));
      }

      if (['s', 'se', 'sw'].includes(activeFurnitureHandle)) {
        newDepth = Math.max(15, Math.round(initialFurnitureState.depth + localDy * 2));
      } else if (['n', 'ne', 'nw'].includes(activeFurnitureHandle)) {
        newDepth = Math.max(15, Math.round(initialFurnitureState.depth - localDy * 2));
      }

      updateFurniture({ width: newWidth, depth: newDepth });
      return;
    }

    // Handle Dragging Wall Handles
    if (activeWallHandle && initialWallState && selectedWall) {
      const snapPt = findSnapVertex(currentPlan.x, currentPlan.y, selectedWall.id);
      const targetPt = snapPt || currentPlan;

      if (activeWallHandle === 'start') {
        updateWall({ xStart: targetPt.x, yStart: targetPt.y });
        return;
      }

      if (activeWallHandle === 'end') {
        updateWall({ xEnd: targetPt.x, yEnd: targetPt.y });
        return;
      }

      if (activeWallHandle === 'body') {
        const dx = currentPlan.x - dragStartPos.x;
        const dy = currentPlan.y - dragStartPos.y;
        updateWall({
          xStart: initialWallState.xStart + dx,
          yStart: initialWallState.yStart + dy,
          xEnd: initialWallState.xEnd + dx,
          yEnd: initialWallState.yEnd + dy,
        });
        return;
      }
    }
  };

  const handleMouseUp = () => {
    const hadDrag = activeFurnitureHandle !== null || activeWallHandle !== null;
    setIsPanning(false);
    setActiveFurnitureHandle(null);
    setActiveWallHandle(null);
    setInitialFurnitureState(null);
    setInitialWallState(null);
    setMagneticSnapPoint(null);
    if (hadDrag) {
      onUpdatePlan({ ...plan, updatedAt: new Date().toISOString() });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Mouse position relative to center of canvas
    const cursorOffsetX = (e.clientX - rect.left) - rect.width / 2;
    const cursorOffsetY = (e.clientY - rect.top) - rect.height / 2;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

    setScale((prevScale) => {
      // Allow deep CAD zoom: 5% (overview) to 1200% (max close-up detail)
      const nextScale = Math.min(Math.max(prevScale * zoomFactor, 0.05), 12.0);
      const ratio = nextScale / prevScale;

      // Perfectly anchor 2D zoom to the exact point under mouse cursor
      setPanOffset((prevPan) => ({
        x: cursorOffsetX - (cursorOffsetX - prevPan.x) * ratio,
        y: cursorOffsetY - (cursorOffsetY - prevPan.y) * ratio,
      }));
      return nextScale;
    });
  };

  const updateFurniture = (patch: Partial<FurnitureItem>) => {
    if (!selectedId) return;
    const updated = plan.furniture.map((f) =>
      f.id === selectedId ? { ...f, ...patch } : f
    );
    onUpdatePlan({ ...plan, furniture: updated, updatedAt: new Date().toISOString() });
  };

  const updateWall = (patch: Partial<Wall>) => {
    if (!selectedId) return;
    const updated = plan.walls.map((w) =>
      w.id === selectedId ? { ...w, ...patch } : w
    );
    onUpdatePlan({ ...plan, walls: updated, updatedAt: new Date().toISOString() });
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (item?.isLocked) {
      alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
      return;
    }
    onUpdatePlan({
      ...plan,
      walls: plan.walls.filter((w) => w.id !== selectedId),
      furniture: plan.furniture.filter((f) => f.id !== selectedId),
      dimensionLines: (plan.dimensionLines || []).filter((d) => d.id !== selectedId),
      textNotes: (plan.textNotes || []).filter((t) => t.id !== selectedId),
      updatedAt: new Date().toISOString(),
    });
    onSelectId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedFurniture) return;
    const copy: FurnitureItem = {
      ...selectedFurniture,
      id: `f_${Date.now()}`,
      name: `${selectedFurniture.name} (Copy)`,
      x: selectedFurniture.x + 30,
      y: selectedFurniture.y + 30,
    };
    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, copy],
      updatedAt: new Date().toISOString(),
    });
    onSelectId(copy.id);
  };

  const handleScaleSelected = (multiplier: number) => {
    if (!selectedFurniture) return;
    updateFurniture({
      width: Math.max(10, Math.round(selectedFurniture.width * multiplier)),
      depth: Math.max(10, Math.round(selectedFurniture.depth * multiplier)),
      height: Math.max(10, Math.round(selectedFurniture.height * multiplier)),
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* Unified Top 2D CAD Header Bar (Zero Overlap Guaranteed) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none select-none">
        {/* Left: Draw & CAD Tools */}
        <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 shadow-sm pointer-events-auto">
          <button
            onClick={() => {
              setToolMode('select');
              setWallStart(null);
              setDimStart(null);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              toolMode === 'select'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Select & Move (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setToolMode('drawWall');
              setWallStart(null);
              setDimStart(null);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              toolMode === 'drawWall'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Draw Wall (W)"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setToolMode('dimension');
              setWallStart(null);
              setDimStart(null);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              toolMode === 'dimension'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dimension Line (D)"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setToolMode('text');
              setWallStart(null);
              setDimStart(null);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              toolMode === 'text'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Note / Text (T)"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setToolMode('pan');
              onSelectId(null);
              setWallStart(null);
              setDimStart(null);
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              toolMode === 'pan'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Free Hand / Pan View Tool (H or Hold Space) - Move canvas without selecting items"
          >
            <Hand className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

          <button
            onClick={onOpenBlueprintModal}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Import Blueprint Scan"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
          </button>

          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1.5 rounded-lg text-xs font-medium transition ${
              snapToGrid
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={`Snap: ${snapToGrid ? 'ON' : 'OFF'} (${GRID_SIZE_CM}cm)`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collision Alert Banner (Non-overlapping at Bottom Left) */}
      {collidingItemIds.size > 0 && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-rose-600 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-rose-500 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {collidingItemIds.size} {collidingItemIds.size === 1 ? 'Item' : 'Items'} Overlapping (Red)
          </span>
        </div>
      )}



      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md text-xs text-slate-700">
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.05))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-1.5 font-mono text-[11px] min-w-[50px] text-center font-bold text-slate-800">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(s * 1.25, 12.0))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900"
          title="Max Zoom In (Up to 1200%)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setScale(0.8);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 ml-1 border-l border-slate-200"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CAD Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block ${
          isPanning
            ? 'cursor-grabbing'
            : toolMode === 'pan' || isSpacePressed
            ? 'cursor-grab'
            : toolMode === 'select'
            ? 'cursor-default'
            : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

