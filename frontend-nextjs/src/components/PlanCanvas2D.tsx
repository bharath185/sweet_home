import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MousePointer,
  Square,
  Ruler,
  Type,
  Hand,
  Image as ImageIcon,
  Magnet,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  RotateCw,
  Eye,
  EyeOff,
  DoorOpen,
  Split,
  Layers,
  FileCode2,
  Download,
  Sparkles,
  Compass,
  Maximize2
} from 'lucide-react';
import { HomePlan, Wall, FurnitureItem, Room, DimensionLine, TextNote, VisitorCameraState } from '../types/plan';
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
  visitorCamera?: VisitorCameraState;
  onUpdateVisitorCamera?: (state: Partial<VisitorCameraState>) => void;
  isWalkMode?: boolean;
}

export type ToolMode =
  | 'select'
  | 'drawWall'
  | 'drawRoom'
  | 'door'
  | 'window'
  | 'dimension'
  | 'text'
  | 'pan';

export interface CADLayers {
  walls: boolean;
  openings: boolean;
  furniture: boolean;
  dimensions: boolean;
  rooms: boolean;
  structure: boolean;
  notes: boolean;
  grid: boolean;
  blueprint: boolean;
}

type FurnitureHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'rotate' | 'body' | null;
type WallHandle = 'start' | 'end' | 'body' | null;

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
  floorMode = 'single',
  onFloorModeChange,
  visitorCamera,
  onUpdateVisitorCamera,
  isWalkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blueprintImgRef = useRef<HTMLImageElement | null>(null);

  // CAD Modes & Precision Controls
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [scale, setScale] = useState<number>(0.8);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingVisitor, setIsDraggingVisitor] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [orthoLock, setOrthoLock] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [wallThicknessCm, setWallThicknessCm] = useState<number>(15);
  const [doorSwingFlipped, setDoorSwingFlipped] = useState<boolean>(false);

  // Layer Visibility Management
  const [layers, setLayers] = useState<CADLayers>({
    walls: true,
    openings: true,
    furniture: true,
    dimensions: true,
    rooms: true,
    structure: true,
    notes: true,
    grid: true,
    blueprint: true,
  });
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);

  // Dynamic Drawing State
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);
  const [dimStart, setDimStart] = useState<{ x: number; y: number } | null>(null);
  const [roomVertices, setRoomVertices] = useState<{ x: number; y: number }[]>([]);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeSnapMarker, setActiveSnapMarker] = useState<{
    x: number;
    y: number;
    type: 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular';
    label: string;
  } | null>(null);

  // Transform Manipulation State
  const [activeFurnitureHandle, setActiveFurnitureHandle] = useState<FurnitureHandle>(null);
  const [activeWallHandle, setActiveWallHandle] = useState<WallHandle>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialFurnitureState, setInitialFurnitureState] = useState<FurnitureItem | null>(null);
  const [initialWallState, setInitialWallState] = useState<Wall | null>(null);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Warning Toast State
  const [walkWarning, setWalkWarning] = useState<string | null>(null);
  const walkWarningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerWalkWarning = (msg: string) => {
    setWalkWarning(msg);
    if (walkWarningTimerRef.current) clearTimeout(walkWarningTimerRef.current);
    walkWarningTimerRef.current = setTimeout(() => {
      setWalkWarning(null);
    }, 2800);
  };

  const unit = plan.preferences?.unitSystem || 'cm';
  const GRID_SIZE_CM = plan.preferences?.gridSize || 20;
  const canvasFloorMode = floorMode || 'single';

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

  // Coordinate Conversion: Plan (cm) -> Screen (px)
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

  // Coordinate Conversion: Screen (px) -> Plan (cm)
  const screenToPlan = useCallback(
    (clientX: number, clientY: number, targetFloorLevel?: number, bypassSnap: boolean = false) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2 + panOffset.x;
      const centerY = rect.height / 2 + panOffset.y;

      let rawX = (clientX - rect.left - centerX) / scale;
      let rawY = (clientY - rect.top - centerY) / scale;

      const effectiveFloor = targetFloorLevel !== undefined ? targetFloorLevel : activeFloor;

      if (canvasFloorMode === 'sideBySide') {
        const offset = getFloorOffset(effectiveFloor);
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

  // Helper to determine floor under screen cursor
  const getFloorAtScreen = useCallback(
    (clientX: number, clientY: number): number => {
      if (!canvasRef.current || canvasFloorMode === 'single') return activeFloor;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickScreenX = clientX - rect.left;
      const clickScreenY = clientY - rect.top;

      for (const fl of allFloors) {
        const centerScreen = planToScreen(0, 0, fl.level);
        const boxW = 860 * scale;
        const boxH = 720 * scale;
        if (
          Math.abs(clickScreenX - centerScreen.x) <= boxW / 2 &&
          Math.abs(clickScreenY - centerScreen.y) <= boxH / 2
        ) {
          return fl.level;
        }
      }
      return activeFloor;
    },
    [canvasFloorMode, activeFloor, allFloors, planToScreen, scale]
  );

  // Filter items for active floor
  const floorWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
  const floorFurniture = plan.furniture.filter(
    (f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false
  );
  const floorRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
  const floorDimensionLines = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === activeFloor);
  const floorTextNotes = (plan.textNotes || []).filter((t) => (t.floorLevel ?? 0) === activeFloor);

  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);
  const selectedWall = plan.walls.find((w) => w.id === selectedId);
  const selectedRoom = plan.rooms.find((r) => r.id === selectedId);

  // Compute screen coordinates of the selected room's center label
  const selectedRoomCenterScreen =
    selectedRoom && selectedRoom.points.length >= 3
      ? (() => {
          const avgX = selectedRoom.points.reduce((acc, p) => acc + p.x, 0) / selectedRoom.points.length;
          const avgY = selectedRoom.points.reduce((acc, p) => acc + p.y, 0) / selectedRoom.points.length;
          return planToScreen(avgX, avgY, selectedRoom.floorLevel ?? activeFloor);
        })()
      : null;

  // Delete selected entity (Room, Wall, Furniture, Dimension, Note)
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;

    if (selectedRoom) {
      onUpdatePlan({
        ...plan,
        rooms: plan.rooms.filter((r) => r.id !== selectedId),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedWall) {
      onUpdatePlan({
        ...plan,
        walls: plan.walls.filter((w) => w.id !== selectedId),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else if (selectedFurniture) {
      if (selectedFurniture.isLocked) {
        triggerWalkWarning(`⚠️ Cannot delete "${selectedFurniture.name}": Locked item.`);
        return;
      }
      onUpdatePlan({
        ...plan,
        furniture: plan.furniture.filter((f) => f.id !== selectedId),
        updatedAt: new Date().toISOString(),
      });
      onSelectId(null);
    } else {
      const isDim = (plan.dimensionLines || []).some((d) => d.id === selectedId);
      const isNote = (plan.textNotes || []).some((n) => n.id === selectedId);
      if (isDim) {
        onUpdatePlan({
          ...plan,
          dimensionLines: (plan.dimensionLines || []).filter((d) => d.id !== selectedId),
          updatedAt: new Date().toISOString(),
        });
        onSelectId(null);
      } else if (isNote) {
        onUpdatePlan({
          ...plan,
          textNotes: (plan.textNotes || []).filter((n) => n.id !== selectedId),
          updatedAt: new Date().toISOString(),
        });
        onSelectId(null);
      }
    }
  }, [selectedId, selectedRoom, selectedWall, selectedFurniture, plan, onUpdatePlan, onSelectId]);

  // Keyboard Shortcuts (Space for Pan, Shift for Ortho, Delete/Backspace for Delete, V/W/R/D/T/H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setOrthoLock(true);
      } else if (e.code === 'KeyF') {
        setDoorSwingFlipped((prev) => !prev);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.code === 'Escape') {
        setToolMode('select');
        setWallStart(null);
        setDimStart(null);
        setRoomVertices([]);
      } else if (e.code === 'Enter') {
        if (toolMode === 'drawRoom' && roomVertices.length >= 3) {
          handleCompleteRoom();
        }
      } else if (e.code === 'KeyV') {
        setToolMode('select');
      } else if (e.code === 'KeyW') {
        setToolMode('drawWall');
      } else if (e.code === 'KeyR') {
        setToolMode('drawRoom');
      } else if (e.code === 'KeyD') {
        setToolMode('dimension');
      } else if (e.code === 'KeyT') {
        setToolMode('text');
      } else if (e.code === 'KeyH') {
        setToolMode('pan');
        onSelectId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setOrthoLock(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toolMode, roomVertices, selectedId, handleDeleteSelected]);

  // Object Snap (OSnap) Calculation Engine
  const findSnapVertex = useCallback(
    (x: number, y: number, excludeWallId?: string) => {
      const snapDist = 20; // 20cm snap radius
      let bestSnap: { x: number; y: number; type: 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular'; label: string } | null = null;
      let minDistance = snapDist;

      // 1. Check Wall Endpoints & Midpoints
      floorWalls.forEach((w) => {
        if (w.id === excludeWallId) return;

        // Start Endpoint
        const dStart = Math.hypot(w.xStart - x, w.yStart - y);
        if (dStart < minDistance) {
          minDistance = dStart;
          bestSnap = { x: w.xStart, y: w.yStart, type: 'endpoint', label: 'Endpoint □' };
        }

        // End Endpoint
        const dEnd = Math.hypot(w.xEnd - x, w.yEnd - y);
        if (dEnd < minDistance) {
          minDistance = dEnd;
          bestSnap = { x: w.xEnd, y: w.yEnd, type: 'endpoint', label: 'Endpoint □' };
        }

        // Wall Midpoint
        const midX = (w.xStart + w.xEnd) / 2;
        const midY = (w.yStart + w.yEnd) / 2;
        const dMid = Math.hypot(midX - x, midY - y);
        if (dMid < minDistance) {
          minDistance = dMid;
          bestSnap = { x: midX, y: midY, type: 'midpoint', label: 'Midpoint △' };
        }
      });

      // 2. Check Room Vertices
      floorRooms.forEach((r) => {
        r.points.forEach((p) => {
          const d = Math.hypot(p.x - x, p.y - y);
          if (d < minDistance) {
            minDistance = d;
            bestSnap = { x: p.x, y: p.y, type: 'endpoint', label: 'Vertex □' };
          }
        });
      });

      return bestSnap;
    },
    [floorWalls, floorRooms]
  );

  // Ortho Lock Helper
  const applyOrthoSnap = (startX: number, startY: number, curX: number, curY: number) => {
    const dx = curX - startX;
    const dy = curY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: curX, y: startY }; // Lock horizontal (0° or 180°)
    } else {
      return { x: startX, y: curY }; // Lock vertical (90° or 270°)
    }
  };

  // Auto-Complete Room Builder
  const handleCompleteRoom = () => {
    if (roomVertices.length < 3) return;
    const defaultName = 'Room ' + (floorRooms.length + 1);
    const roomName = prompt('Enter Room Name (e.g., Living Room, Master Bedroom, Kitchen):', defaultName) || defaultName;

    // Shoelace algorithm for exact area
    let area = 0;
    for (let i = 0; i < roomVertices.length; i++) {
      const j = (i + 1) % roomVertices.length;
      area += roomVertices[i].x * roomVertices[j].y;
      area -= roomVertices[j].x * roomVertices[i].y;
    }
    const areaSqM = Math.abs(area) / 20000;

    const newRoom: Room = {
      id: 'room_' + Date.now(),
      name: roomName.trim(),
      points: [...roomVertices],
      floorColor: '#f1f5f9',
      areaSquareMeters: parseFloat(areaSqM.toFixed(1)),
      floorLevel: activeFloor,
    };

    onUpdatePlan({
      ...plan,
      rooms: [...plan.rooms, newRoom],
      updatedAt: new Date().toISOString(),
    });

    setRoomVertices([]);
    setToolMode('select');
  };

  // One-Click Toggle Auto-Dimension All Exterior Walls (Click to show, Click again to remove)
  const handleAutoDimension = () => {
    if (floorDimensionLines.length > 0) {
      // Toggle OFF: Remove dimensions from this active floor
      onUpdatePlan({
        ...plan,
        dimensionLines: (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) !== activeFloor),
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Toggle ON: Auto generate exterior wall dimension lines
    if (floorWalls.length === 0) return;
    const newDimensions: DimensionLine[] = [];

    floorWalls.forEach((w) => {
      const dx = w.xEnd - w.xStart;
      const dy = w.yEnd - w.yStart;
      const len = Math.hypot(dx, dy);
      if (len < 30) return;

      const normX = -dy / len;
      const normY = dx / len;
      const offsetDist = 35; // 35cm exterior offset

      newDimensions.push({
        id: 'dim_auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + '_' + w.id,
        xStart: Math.round(w.xStart + normX * offsetDist),
        yStart: Math.round(w.yStart + normY * offsetDist),
        xEnd: Math.round(w.xEnd + normX * offsetDist),
        yEnd: Math.round(w.yEnd + normY * offsetDist),
        offset: 20,
        floorLevel: activeFloor,
      });
    });

    onUpdatePlan({
      ...plan,
      dimensionLines: [...(plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) !== activeFloor), ...newDimensions],
      updatedAt: new Date().toISOString(),
    });
  };

  // Insert Architectural CAD Door on Wall
  const handleInsertDoor = (wall: Wall, clickPt: { x: number; y: number }) => {
    const dx = wall.xEnd - wall.xStart;
    const dy = wall.yEnd - wall.yStart;
    const angle = Math.atan2(dy, dx);

    const newDoor: FurnitureItem = {
      id: 'door_' + Date.now(),
      catalogId: 'door',
      name: 'Architectural Swing Door',
      category: 'Doors & Windows',
      x: Math.round(clickPt.x),
      y: Math.round(clickPt.y),
      elevation: 0,
      angle: angle + (doorSwingFlipped ? Math.PI : 0),
      width: 90,
      depth: 12,
      height: 210,
      model: '/models/door.obj',
      icon: '/models/door.png',
      color: '#0284c7',
      floorLevel: activeFloor,
    };

    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, newDoor],
      updatedAt: new Date().toISOString(),
    });
    setToolMode('select');
    onSelectId(newDoor.id);
  };

  // Insert Architectural CAD Window on Wall
  const handleInsertWindow = (wall: Wall, clickPt: { x: number; y: number }) => {
    const dx = wall.xEnd - wall.xStart;
    const dy = wall.yEnd - wall.yStart;
    const angle = Math.atan2(dy, dx);

    const newWindow: FurnitureItem = {
      id: 'window_' + Date.now(),
      catalogId: 'window',
      name: 'Double-Glazed Casement Window',
      category: 'Doors & Windows',
      x: Math.round(clickPt.x),
      y: Math.round(clickPt.y),
      elevation: 90,
      angle: angle,
      width: 120,
      depth: 15,
      height: 120,
      model: '/models/window.obj',
      icon: '/models/window.png',
      color: '#38bdf8',
      floorLevel: activeFloor,
    };

    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, newWindow],
      updatedAt: new Date().toISOString(),
    });
    setToolMode('select');
    onSelectId(newWindow.id);
  };

  // Export Scalable Vector SVG Blueprint
  const handleExportSVG = () => {
    const flRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
    const flWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
    const flFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false);
    const flDims = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === activeFloor);

    let minX = -400, maxX = 400, minY = -300, maxY = 300;
    flRooms.forEach((r) => r.points.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
    flWalls.forEach((w) => { minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd); minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd); });

    const width = maxX - minX + 160;
    const height = maxY - minY + 160;
    const viewBox = (minX - 80) + ' ' + (minY - 80) + ' ' + width + ' ' + height;

    let svg = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" width="' + (width * 2) + 'px" height="' + (height * 2) + 'px" style="background:#ffffff; font-family:system-ui, sans-serif;">\n' +
      '  <defs>\n' +
      '    <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">\n' +
      '      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.5"/>\n' +
      '    </pattern>\n' +
      '  </defs>\n' +
      '  <rect x="' + (minX - 80) + '" y="' + (minY - 80) + '" width="' + width + '" height="' + height + '" fill="url(#cadGrid)" />\n';

    // Rooms
    flRooms.forEach((r) => {
      if (r.points.length < 3) return;
      const pts = r.points.map((p) => p.x + ',' + p.y).join(' ');
      svg += '  <polygon points="' + pts + '" fill="rgba(240, 249, 255, 0.7)" stroke="#0284c7" stroke-width="1.5" />\n';
    });

    // Walls
    flWalls.forEach((w) => {
      svg += '  <line x1="' + w.xStart + '" y1="' + w.yStart + '" x2="' + w.xEnd + '" y2="' + w.yEnd + '" stroke="#1e293b" stroke-width="' + (w.thickness || 15) + '" stroke-linecap="square" />\n';
    });

    // Furniture
    flFurniture.forEach((f) => {
      svg += '  <g transform="translate(' + f.x + ', ' + f.y + ') rotate(' + (((f.angle || 0) * 180) / Math.PI) + ')">\n';
      svg += '    <rect x="' + (-f.width / 2) + '" y="' + (-f.depth / 2) + '" width="' + f.width + '" height="' + f.depth + '" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />\n';
      svg += '    <text x="0" y="4" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">' + f.name + '</text>\n';
      svg += '  </g>\n';
    });

    // Dimensions
    flDims.forEach((d) => {
      svg += '  <line x1="' + d.xStart + '" y1="' + d.yStart + '" x2="' + d.xEnd + '" y2="' + d.yEnd + '" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,2" />\n';
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeProjectName = (plan.name || 'Floorplan').replace(/\s+/g, '_');
    link.download = safeProjectName + '_Floor_' + activeFloor + '_Vector.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export 4K Ultra-HD Blueprint PNG
  const handleExportHDImage = () => {
    const flObj = allFloors.find((f) => f.level === activeFloor) || {
      level: activeFloor,
      name: activeFloor === 0 ? 'Ground Floor' : '1st Floor',
    };
    const floorDisplayName = flObj.level === 0 ? 'Ground Floor' : flObj.level === 1 ? '1st Floor' : (flObj.name || ('Floor ' + flObj.level));

    const expWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
    const expRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
    const expFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false);
    const expDimensions = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === activeFloor);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    expRooms.forEach((r) => r.points.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
    expWalls.forEach((w) => { minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd); minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd); });
    expFurniture.forEach((f) => { minX = Math.min(minX, f.x - f.width / 2); maxX = Math.max(maxX, f.x + f.width / 2); minY = Math.min(minY, f.y - f.depth / 2); maxY = Math.max(maxY, f.y + f.depth / 2); });

    if (minX === Infinity) { minX = -350; maxX = 350; minY = -250; maxY = 250; }

    const marginCm = 120;
    const planW = (maxX - minX) + marginCm * 2;
    const planH = (maxY - minY) + marginCm * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const exportCanvas = document.createElement('canvas');
    const width = 3840;
    const height = 2160;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ectx = exportCanvas.getContext('2d');
    if (!ectx) return;

    ectx.imageSmoothingEnabled = true;
    ectx.imageSmoothingQuality = 'high';

    ectx.fillStyle = '#ffffff';
    ectx.fillRect(0, 0, width, height);

    // Grid
    ectx.strokeStyle = '#f1f5f9';
    ectx.lineWidth = 1.5;
    for (let gx = 0; gx < width; gx += 40) { ectx.beginPath(); ectx.moveTo(gx, 0); ectx.lineTo(gx, height); ectx.stroke(); }
    for (let gy = 0; gy < height; gy += 40) { ectx.beginPath(); ectx.moveTo(0, gy); ectx.lineTo(width, gy); ectx.stroke(); }

    // Border
    ectx.strokeStyle = '#0f172a';
    ectx.lineWidth = 4;
    ectx.strokeRect(60, 60, width - 120, height - 120);
    ectx.lineWidth = 1.5;
    ectx.strokeRect(72, 72, width - 144, height - 144);

    const printableW = width - 360;
    const printableH = height - 360;
    const hdScale = Math.min(printableW / planW, printableH / planH);
    const sheetCenterX = width / 2;
    const sheetCenterY = height / 2 - 30;

    const toHDScreen = (x: number, y: number) => ({
      x: sheetCenterX + (x - centerX) * hdScale,
      y: sheetCenterY + (y - centerY) * hdScale,
    });

    // Draw Rooms
    expRooms.forEach((room) => {
      if (room.points.length < 3) return;
      ectx.fillStyle = room.floorColor || 'rgba(240, 249, 255, 0.7)';
      ectx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
      ectx.lineWidth = 3;
      ectx.beginPath();
      const p0 = toHDScreen(room.points[0].x, room.points[0].y);
      ectx.moveTo(p0.x, p0.y);
      for (let i = 1; i < room.points.length; i++) {
        const p = toHDScreen(room.points[i].x, room.points[i].y);
        ectx.lineTo(p.x, p.y);
      }
      ectx.closePath();
      ectx.fill();
      ectx.stroke();

      const avgX = room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length;
      const avgY = room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length;
      const roomCenter = toHDScreen(avgX, avgY);

      ectx.save();
      ectx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ectx.strokeStyle = '#cbd5e1';
      ectx.lineWidth = 2;
      ectx.beginPath();
      ectx.roundRect(roomCenter.x - 120, roomCenter.y - 28, 240, 56, 10);
      ectx.fill();
      ectx.stroke();

      ectx.fillStyle = '#0f172a';
      ectx.font = 'bold 20px system-ui';
      ectx.textAlign = 'center';
      ectx.textBaseline = 'middle';
      ectx.fillText(room.name.toUpperCase(), roomCenter.x, roomCenter.y - 12);
      ectx.fillStyle = '#0284c7';
      ectx.font = 'bold 17px monospace';
      ectx.fillText(formatArea(room.areaSquareMeters || 12.5, unit), roomCenter.x, roomCenter.y + 14);
      ectx.restore();
    });

    // Draw Walls
    expWalls.forEach((w) => {
      const p1 = toHDScreen(w.xStart, w.yStart);
      const p2 = toHDScreen(w.xEnd, w.yEnd);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return;
      const angle = Math.atan2(dy, dx);
      const th = Math.max(8, (w.thickness || 15) * hdScale);

      ectx.save();
      ectx.translate(p1.x, p1.y);
      ectx.rotate(angle);
      ectx.fillStyle = '#334155';
      ectx.fillRect(0, -th / 2, len, th);
      ectx.strokeStyle = '#0f172a';
      ectx.lineWidth = 2.5;
      ectx.strokeRect(0, -th / 2, len, th);
      ectx.restore();
    });

    // Draw Furniture
    expFurniture.forEach((item) => {
      const sp = toHDScreen(item.x, item.y);
      const w = item.width * hdScale;
      const d = item.depth * hdScale;
      ectx.save();
      ectx.translate(sp.x, sp.y);
      ectx.rotate(item.angle || 0);

      const isDoor = item.catalogId === 'door' || item.category === 'Doors & Windows';
      if (isDoor) {
        ectx.strokeStyle = '#0f172a';
        ectx.lineWidth = 3;
        ectx.strokeRect(-w / 2, -d / 2, w, d);
        ectx.strokeStyle = '#0284c7';
        ectx.lineWidth = 2;
        ectx.setLineDash([6, 4]);
        ectx.beginPath();
        ectx.arc(-w / 2, d / 2, w, 0, -Math.PI / 2, true);
        ectx.stroke();
      } else {
        ectx.fillStyle = item.color || '#f8fafc';
        ectx.strokeStyle = '#1e293b';
        ectx.lineWidth = 2.5;
        ectx.beginPath();
        ectx.roundRect(-w / 2, -d / 2, w, d, 6);
        ectx.fill();
        ectx.stroke();

        ectx.fillStyle = '#0f172a';
        ectx.font = 'bold 15px system-ui';
        ectx.textAlign = 'center';
        ectx.textBaseline = 'middle';
        ectx.fillText(item.name, 0, 0);
      }
      ectx.restore();
    });

    // Title Block
    const stampW = 760;
    const stampH = 210;
    const stampX = width - stampW - 75;
    const stampY = height - stampH - 75;

    ectx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ectx.beginPath();
    ectx.roundRect(stampX, stampY, stampW, stampH, 12);
    ectx.fill();
    ectx.strokeStyle = '#0284c7';
    ectx.lineWidth = 3.5;
    ectx.stroke();

    ectx.fillStyle = '#0284c7';
    ectx.fillRect(stampX, stampY, stampW, 46);
    ectx.fillStyle = '#ffffff';
    ectx.font = 'bold 20px system-ui';
    ectx.fillText('📐 ARCHITECTURAL ENGINEERING BLUEPRINT', stampX + 24, stampY + 23);

    ectx.fillStyle = '#0f172a';
    ectx.font = 'bold 19px system-ui';
    ectx.fillText('Project: ' + (plan.name || 'Architectural Floor Plan'), stampX + 24, stampY + 80);
    ectx.fillStyle = '#0284c7';
    ectx.font = 'bold 17px system-ui';
    ectx.fillText('Drawing: FLOOR PLAN • ' + floorDisplayName.toUpperCase() + ' (LEVEL ' + activeFloor + ')', stampX + 24, stampY + 118);
    ectx.fillStyle = '#475569';
    ectx.font = '500 15px system-ui';
    ectx.fillText('Scale: 1:50 Ultra-HD 4K (3840 × 2160 @ 300 DPI)   •   Units: ' + unit.toUpperCase(), stampX + 24, stampY + 152);
    ectx.fillText('Rooms: ' + expRooms.length + '   •   Walls: ' + expWalls.length + '   •   Date: ' + new Date().toLocaleDateString(), stampX + 24, stampY + 182);

    const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    const safePrj = (plan.name || 'Floorplan').replace(/\s+/g, '_');
    const safeFl = floorDisplayName.replace(/\s+/g, '_');
    link.download = safePrj + '_' + safeFl + '_4K_HD_Blueprint.png';
    link.click();
  };

  // Main 60fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Blueprint Background Grid
      if (layers.grid) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.6;
        const gridSpacingPx = GRID_SIZE_CM * scale;
        if (gridSpacingPx >= 8) {
          const centerX = width / 2 + panOffset.x;
          const centerY = height / 2 + panOffset.y;
          const startX = centerX % gridSpacingPx;
          const startY = centerY % gridSpacingPx;

          ctx.beginPath();
          for (let x = startX; x < width; x += gridSpacingPx) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
          }
          for (let y = startY; y < height; y += gridSpacingPx) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }
          ctx.stroke();
        }
      }

      // Side-by-Side Floor Plates
      if (canvasFloorMode === 'sideBySide') {
        allFloors.forEach((fl) => {
          const isCurActive = activeFloor === fl.level;
          const boxW = 860 * scale;
          const boxH = 720 * scale;
          const centerScreen = planToScreen(0, 0, fl.level);

          ctx.save();
          ctx.fillStyle = isCurActive ? 'rgba(2, 132, 199, 0.03)' : 'rgba(241, 245, 249, 0.4)';
          ctx.fillRect(centerScreen.x - boxW / 2, centerScreen.y - boxH / 2, boxW, boxH);

          ctx.strokeStyle = isCurActive ? '#0284c7' : '#cbd5e1';
          ctx.lineWidth = isCurActive ? 2.5 : 1;
          ctx.setLineDash(isCurActive ? [] : [6, 4]);
          ctx.strokeRect(centerScreen.x - boxW / 2, centerScreen.y - boxH / 2, boxW, boxH);

          // Top Header Placard
          ctx.setLineDash([]);
          const floorTitle = fl.level === 0 ? '🏢 GROUND FLOOR' : fl.level === 1 ? '🏡 1ST FLOOR' : ('🏡 FLOOR ' + fl.level);
          const pillW = isCurActive ? 230 : 200;
          const pillH = 34;
          const pillY = centerScreen.y - boxH / 2;

          ctx.shadowColor = isCurActive ? 'rgba(2, 132, 199, 0.35)' : 'rgba(15, 23, 42, 0.12)';
          ctx.shadowBlur = isCurActive ? 12 : 6;
          ctx.shadowOffsetY = 2;

          if (isCurActive) {
            const grad = ctx.createLinearGradient(centerScreen.x - pillW / 2, 0, centerScreen.x + pillW / 2, 0);
            grad.addColorStop(0, fl.level === 0 ? '#0284c7' : '#059669');
            grad.addColorStop(1, fl.level === 0 ? '#0369a1' : '#047857');
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          }

          ctx.beginPath();
          ctx.roundRect(centerScreen.x - pillW / 2, pillY - pillH / 2, pillW, pillH, 8);
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = isCurActive ? '#ffffff' : '#cbd5e1';
          ctx.lineWidth = isCurActive ? 2 : 1;
          ctx.stroke();

          ctx.fillStyle = isCurActive ? '#ffffff' : '#475569';
          ctx.font = 'bold 12px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(isCurActive ? ('● ' + floorTitle + ' (ACTIVE)') : floorTitle, centerScreen.x, pillY);
          ctx.restore();
        });
      }

      const floorsToRender = canvasFloorMode === 'sideBySide' ? allFloors : [{ level: activeFloor, name: 'Active Floor' }];

      floorsToRender.forEach((currentFloorObj) => {
        const flLevel = currentFloorObj.level;
        const curRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === flLevel);
        const curWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === flLevel);
        const curFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === flLevel && f.isVisible !== false);
        const curDimensions = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === flLevel);
        const curTextNotes = (plan.textNotes || []).filter((t) => (t.floorLevel ?? 0) === flLevel);

        // ==========================================
        // [Z-INDEX LAYER 1]: Room Polygon Fills
        // ==========================================
        if (layers.rooms) {
          curRooms.forEach((room) => {
            if (room.points.length < 3) return;
            const isSelected = selectedId === room.id;
            ctx.fillStyle = isSelected ? 'rgba(14, 165, 233, 0.15)' : room.floorColor || 'rgba(14, 165, 233, 0.06)';
            ctx.strokeStyle = isSelected ? '#0284c7' : 'rgba(14, 165, 233, 0.4)';
            ctx.lineWidth = isSelected ? 2 : 1.2;

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
          });
        }

        // ==========================================
        // [Z-INDEX LAYER 2]: Furniture & Interior Items
        // ==========================================
        if (layers.furniture || layers.structure) {
          curFurniture.forEach((item) => {
            const isDoor = item.catalogId === 'door' || item.category === 'Doors & Windows';
            if (isDoor) return; // Doors drawn in Layer 4 (Openings)

            const isSelected = selectedId === item.id;
            const sp = planToScreen(item.x, item.y, flLevel);
            const w = item.width * scale;
            const d = item.depth * scale;

            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.rotate(item.angle || 0);

            // Standard Furniture Item
            ctx.fillStyle = item.color || '#f8fafc';
            ctx.strokeStyle = isSelected ? '#0284c7' : '#334155';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.roundRect(-w / 2, -d / 2, w, d, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 9.5px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.name, 0, 0);

            // Selection Handles
            if (isSelected) {
              ctx.strokeStyle = '#0284c7';
              ctx.fillStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              const handles = [
                [-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]
              ];
              handles.forEach(([hx, hy]) => {
                ctx.fillRect(hx - 4, hy - 4, 8, 8);
                ctx.strokeRect(hx - 4, hy - 4, 8, 8);
              });
            }
            ctx.restore();
          });
        }

        // ==========================================
        // [Z-INDEX LAYER 3]: Architectural Walls
        // ==========================================
        if (layers.walls) {
          curWalls.forEach((wall) => {
            const isSelected = selectedId === wall.id;
            const p1 = planToScreen(wall.xStart, wall.yStart, flLevel);
            const p2 = planToScreen(wall.xEnd, wall.yEnd, flLevel);

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            if (len === 0) return;
            const angle = Math.atan2(dy, dx);
            const thPx = Math.max(5, (wall.thickness || 15) * scale);

            ctx.save();
            ctx.translate(p1.x, p1.y);
            ctx.rotate(angle);

            // Double line solid dark CAD wall
            ctx.fillStyle = isSelected ? '#0284c7' : '#334155';
            ctx.fillRect(0, -thPx / 2, len, thPx);

            ctx.strokeStyle = isSelected ? '#38bdf8' : '#0f172a';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.strokeRect(0, -thPx / 2, len, thPx);

            // Wall Length Dimension Callout
            const lengthCm = Math.round(Math.hypot(wall.xEnd - wall.xStart, wall.yEnd - wall.yStart));
            const dimStr = formatDistance(lengthCm, unit);

            if (len > 60) {
              ctx.save();
              ctx.translate(len / 2, 0);
              if (Math.abs(angle) > Math.PI / 2) ctx.rotate(Math.PI);

              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.roundRect(-30, -8, 60, 16, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#0f172a';
              ctx.font = 'bold 9.5px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(dimStr, 0, 0);
              ctx.restore();
            }
            ctx.restore();
          });
        }

        // ==========================================
        // [Z-INDEX LAYER 4]: Openings (Doors & Windows)
        // ==========================================
        if (layers.openings) {
          curFurniture.forEach((item) => {
            const isDoor = item.catalogId === 'door' || item.category === 'Doors & Windows';
            if (!isDoor) return;

            const isSelected = selectedId === item.id;
            const sp = planToScreen(item.x, item.y, flLevel);
            const w = item.width * scale;
            const d = item.depth * scale;

            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.rotate(item.angle || 0);

            // Architectural Door & 90 deg Swing Arc
            ctx.strokeStyle = isSelected ? '#0284c7' : '#0f172a';
            ctx.lineWidth = 2;
            ctx.strokeRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = isSelected ? '#0284c7' : '#0284c7';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(-w / 2, d / 2, w, 0, -Math.PI / 2, true);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-w / 2, d / 2);
            ctx.lineTo(-w / 2, d / 2 - w);
            ctx.stroke();
            ctx.restore();
          });
        }

        // ==========================================
        // [Z-INDEX LAYER 5]: Room Badges & Text Notes
        // ==========================================
        if (layers.rooms) {
          curRooms.forEach((room) => {
            if (room.points.length < 3) return;
            const isSelected = selectedId === room.id;
            const avgX = room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length;
            const avgY = room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length;
            const screenAvg = planToScreen(avgX, avgY, flLevel);

            const roomTitle = room.name.toUpperCase();
            const areaStr = formatArea(room.areaSquareMeters || 12.5, unit);

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
            ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;
            ctx.beginPath();
            ctx.roundRect(screenAvg.x - 70, screenAvg.y - 17, 140, 34, 6);
            ctx.fill();

            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = isSelected ? '#0284c7' : '#cbd5e1';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(roomTitle, screenAvg.x, screenAvg.y - 6);

            ctx.fillStyle = '#0284c7';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(areaStr, screenAvg.x, screenAvg.y + 7);
            ctx.restore();
          });
        }

        if (layers.notes) {
          curTextNotes.forEach((note) => {
            const np = planToScreen(note.x, note.y, flLevel);
            ctx.save();
            ctx.fillStyle = note.color || '#0f172a';
            ctx.font = `${note.fontSize || 12}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillText(note.text, np.x, np.y);
            ctx.restore();
          });
        }

        // ==========================================
        // [Z-INDEX LAYER 6]: Dimension Lines & Measurements
        // ==========================================
        if (layers.dimensions) {
          curDimensions.forEach((dim) => {
            const p1 = planToScreen(dim.xStart, dim.yStart, flLevel);
            const p2 = planToScreen(dim.xEnd, dim.yEnd, flLevel);
            const isSelected = selectedId === dim.id;

            ctx.strokeStyle = isSelected ? '#0284c7' : '#0284c7';
            ctx.lineWidth = isSelected ? 2 : 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // End Ticks
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const tickLen = 8;
            [p1, p2].forEach((pt) => {
              ctx.beginPath();
              ctx.moveTo(pt.x - Math.sin(angle) * tickLen, pt.y + Math.cos(angle) * tickLen);
              ctx.lineTo(pt.x + Math.sin(angle) * tickLen, pt.y - Math.cos(angle) * tickLen);
              ctx.stroke();
            });

            const dist = Math.round(Math.hypot(dim.xEnd - dim.xStart, dim.yEnd - dim.yStart));
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.roundRect(mid.x - 30, mid.y - 8, 60, 16, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#0284c7';
            ctx.font = 'bold 9.5px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatDistance(dist, unit), mid.x, mid.y);
          });
        }
      });

      // 6. Real-Time Room Drafting Preview Loop
      if (toolMode === 'drawRoom' && roomVertices.length > 0) {
        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        const p0 = planToScreen(roomVertices[0].x, roomVertices[0].y, activeFloor);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < roomVertices.length; i++) {
          const p = planToScreen(roomVertices[i].x, roomVertices[i].y, activeFloor);
          ctx.lineTo(p.x, p.y);
        }
        const curMouseScreen = planToScreen(mouseCanvasPos.x, mouseCanvasPos.y, activeFloor);
        ctx.lineTo(curMouseScreen.x, curMouseScreen.y);
        ctx.stroke();
        ctx.fill();
        ctx.setLineDash([]);

        // Vertex markers
        roomVertices.forEach((v, idx) => {
          const vp = planToScreen(v.x, v.y, activeFloor);
          ctx.fillStyle = idx === 0 ? '#10b981' : '#0284c7';
          ctx.beginPath();
          ctx.arc(vp.x, vp.y, idx === 0 ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 7. Dynamic Wall Drafting Preview
      if (toolMode === 'drawWall' && wallStart) {
        const p1 = planToScreen(wallStart.x, wallStart.y, activeFloor);
        const effectiveEnd = orthoLock ? applyOrthoSnap(wallStart.x, wallStart.y, mouseCanvasPos.x, mouseCanvasPos.y) : mouseCanvasPos;
        const p2 = planToScreen(effectiveEnd.x, effectiveEnd.y, activeFloor);

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = Math.max(4, wallThicknessCm * scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 8. Virtual Visitor Avatar & Conical Frustum in Walk Mode
      if (isWalkMode && visitorCamera && (visitorCamera.floorLevel === undefined || visitorCamera.floorLevel === activeFloor)) {
        const vPos = planToScreen(visitorCamera.x, visitorCamera.y, activeFloor);
        const vAngle = visitorCamera.yaw || 0;

        ctx.save();
        ctx.translate(vPos.x, vPos.y);

        const fovRad = (65 * Math.PI) / 180;
        const coneDistPx = 180 * scale;
        const screenLookAngle = Math.atan2(-Math.cos(vAngle), Math.sin(vAngle));

        const gradient = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.max(25, coneDistPx));
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.18)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(25, coneDistPx), screenLookAngle - fovRad / 2, screenLookAngle + fovRad / 2);
        ctx.closePath();
        ctx.fill();

        // Person Avatar
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚶', 0, 0);
        ctx.restore();
      }

      // 9. OSnap Visual Beacon Glyph
      if (activeSnapMarker) {
        const sp = planToScreen(activeSnapMarker.x, activeSnapMarker.y, activeFloor);
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 2;

        if (activeSnapMarker.type === 'endpoint') {
          ctx.strokeRect(sp.x - 6, sp.y - 6, 12, 12);
          ctx.fillRect(sp.x - 6, sp.y - 6, 12, 12);
        } else if (activeSnapMarker.type === 'midpoint') {
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y - 7);
          ctx.lineTo(sp.x + 6, sp.y + 5);
          ctx.lineTo(sp.x - 6, sp.y + 5);
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
        }

        ctx.fillStyle = '#059669';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(activeSnapMarker.label, sp.x + 12, sp.y - 6);
        ctx.restore();
      }

      // 10. Dynamic Heads-Up Display (HUD) Tooltip
      if (['drawWall', 'drawRoom', 'dimension'].includes(toolMode) && (wallStart || dimStart || roomVertices.length > 0)) {
        const startPt = wallStart || dimStart || roomVertices[roomVertices.length - 1];
        if (startPt) {
          const effectiveEnd = orthoLock ? applyOrthoSnap(startPt.x, startPt.y, mouseCanvasPos.x, mouseCanvasPos.y) : mouseCanvasPos;
          const dist = Math.round(Math.hypot(effectiveEnd.x - startPt.x, effectiveEnd.y - startPt.y));
          const angleDeg = Math.round((Math.atan2(-(effectiveEnd.y - startPt.y), effectiveEnd.x - startPt.x) * 180) / Math.PI);
          const posScreen = planToScreen(effectiveEnd.x, effectiveEnd.y, activeFloor);

          ctx.save();
          const hudText = 'L: ' + formatDistance(dist, unit) + '  ∠ ' + (angleDeg >= 0 ? angleDeg : 360 + angleDeg) + '°';
          ctx.font = 'bold 11px monospace';
          const hudW = ctx.measureText(hudText).width + 18;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(posScreen.x + 15, posScreen.y - 28, hudW, 22, 6);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(hudText, posScreen.x + 24, posScreen.y - 17);
          ctx.restore();
        }
      }

      // 11. North Compass & Metric Scale Bar
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

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(6, 0); ctx.lineTo(0, -3); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, 16); ctx.lineTo(-6, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();

      ctx.font = 'bold 9px system-ui';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('N', 0, -6);
      ctx.restore();
    };

    render();
  }, [
    scale,
    panOffset,
    selectedId,
    toolMode,
    wallStart,
    dimStart,
    roomVertices,
    mouseCanvasPos,
    activeSnapMarker,
    orthoLock,
    wallThicknessCm,
    layers,
    activeFloor,
    canvasFloorMode,
    floorWalls,
    floorFurniture,
    floorRooms,
    floorDimensionLines,
    visitorCamera,
    isWalkMode,
    collidingItemIds,
    unit,
  ]);

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || toolMode === 'pan' || isSpacePressed || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      if (selectedId) onSelectId(null);
      return;
    }

    const rect = canvasRef.current!.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Side-by-Side Floor Selection
    if (canvasFloorMode === 'sideBySide') {
      for (const fl of allFloors) {
        const centerScreen = planToScreen(0, 0, fl.level);
        const boxW = 860 * scale;
        const boxH = 720 * scale;
        if (Math.abs(clickScreenX - centerScreen.x) <= boxW / 2 && Math.abs(clickScreenY - centerScreen.y) <= boxH / 2) {
          if (activeFloor !== fl.level && onFloorChange) {
            onFloorChange(fl.level);
          }
          break;
        }
      }
    }

    const clickPlan = screenToPlan(e.clientX, e.clientY);

    // 2D Visitor Dragging
    if (isWalkMode && visitorCamera && toolMode === 'select' && (visitorCamera.floorLevel === undefined || visitorCamera.floorLevel === activeFloor)) {
      const vScreen = planToScreen(visitorCamera.x, visitorCamera.y, activeFloor);
      const vDistScreen = Math.hypot(clickScreenX - vScreen.x, clickScreenY - vScreen.y);
      if (vDistScreen <= 24) {
        setIsDraggingVisitor(true);
        return;
      }
    }

    // CAD Tool: Draw Wall
    if (toolMode === 'drawWall') {
      const snap = findSnapVertex(clickPlan.x, clickPlan.y);
      const startPt = snap ? { x: snap.x, y: snap.y } : clickPlan;

      if (!wallStart) {
        setWallStart(startPt);
      } else {
        const endPt = orthoLock ? applyOrthoSnap(wallStart.x, wallStart.y, startPt.x, startPt.y) : startPt;
        const newWall: Wall = {
          id: 'wall_' + Date.now(),
          xStart: wallStart.x,
          yStart: wallStart.y,
          xEnd: endPt.x,
          yEnd: endPt.y,
          thickness: wallThicknessCm,
          height: 250,
          color: '#f8fafc',
          floorLevel: activeFloor,
        };
        onUpdatePlan({ ...plan, walls: [...plan.walls, newWall], updatedAt: new Date().toISOString() });
        setWallStart(endPt); // Continue wall chain
      }
      return;
    }

    // CAD Tool: Draw Room Polygon
    if (toolMode === 'drawRoom') {
      const snap = findSnapVertex(clickPlan.x, clickPlan.y);
      const vertex = snap ? { x: snap.x, y: snap.y } : clickPlan;

      // Check if clicking close to first point to complete room
      if (roomVertices.length >= 3) {
        const firstPt = roomVertices[0];
        if (Math.hypot(firstPt.x - vertex.x, firstPt.y - vertex.y) < 25) {
          handleCompleteRoom();
          return;
        }
      }
      setRoomVertices((prev) => [...prev, vertex]);
      return;
    }

    // CAD Tool: Insert Door
    if (toolMode === 'door') {
      const hitWall = floorWalls.find((w) => {
        const d = pointToSegmentDist(clickPlan.x, clickPlan.y, w.xStart, w.yStart, w.xEnd, w.yEnd);
        return d <= (w.thickness || 15) / 2 + 20;
      });
      if (hitWall) {
        handleInsertDoor(hitWall, clickPlan);
      } else {
        triggerWalkWarning('⚠️ Click on any wall to place an architectural door.');
      }
      return;
    }

    // CAD Tool: Insert Window
    if (toolMode === 'window') {
      const hitWall = floorWalls.find((w) => {
        const d = pointToSegmentDist(clickPlan.x, clickPlan.y, w.xStart, w.yStart, w.xEnd, w.yEnd);
        return d <= (w.thickness || 15) / 2 + 20;
      });
      if (hitWall) {
        handleInsertWindow(hitWall, clickPlan);
      } else {
        triggerWalkWarning('⚠️ Click on any wall to place an architectural window.');
      }
      return;
    }

    // CAD Tool: Dimension Line
    if (toolMode === 'dimension') {
      const snap = findSnapVertex(clickPlan.x, clickPlan.y);
      const pt = snap ? { x: snap.x, y: snap.y } : clickPlan;
      if (!dimStart) {
        setDimStart(pt);
      } else {
        const newDim: DimensionLine = {
          id: 'dim_' + Date.now(),
          xStart: dimStart.x,
          yStart: dimStart.y,
          xEnd: pt.x,
          yEnd: pt.y,
          offset: 20,
          floorLevel: activeFloor,
        };
        onUpdatePlan({ ...plan, dimensionLines: [...(plan.dimensionLines || []), newDim], updatedAt: new Date().toISOString() });
        setDimStart(null);
        setToolMode('select');
      }
      return;
    }

    // Select Tool Hit Testing
    if (toolMode === 'select') {
      // 1. Check Furniture
      const hitFurniture = floorFurniture.slice().reverse().find((f) => {
        const dx = clickPlan.x - f.x;
        const dy = clickPlan.y - f.y;
        const cos = Math.cos(-(f.angle || 0));
        const sin = Math.sin(-(f.angle || 0));
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;
        return Math.abs(lx) <= f.width / 2 && Math.abs(ly) <= f.depth / 2;
      });

      if (hitFurniture) {
        onSelectId(hitFurniture.id);
        setActiveFurnitureHandle('body');
        setDragStartPos(clickPlan);
        setInitialFurnitureState({ ...hitFurniture });
        return;
      }

      // 2. Check Walls
      const hitWall = floorWalls.find((w) => {
        const d = pointToSegmentDist(clickPlan.x, clickPlan.y, w.xStart, w.yStart, w.xEnd, w.yEnd);
        return d <= (w.thickness || 15) / 2 + 10;
      });

      if (hitWall) {
        onSelectId(hitWall.id);
        setActiveWallHandle('body');
        setDragStartPos(clickPlan);
        setInitialWallState({ ...hitWall });
        return;
      }

      // 3. Check Rooms
      const hitRoom = floorRooms.find((r) => isPointInPolygon(clickPlan, r.points));
      if (hitRoom) {
        onSelectId(hitRoom.id);
        return;
      }

      onSelectId(null);
    }
  };

  // Mouse Move Event Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPlan = screenToPlan(e.clientX, e.clientY);
    setMouseCanvasPos(currentPlan);

    // Active OSnap calculation
    const snap = findSnapVertex(currentPlan.x, currentPlan.y);
    setActiveSnapMarker(snap);

    // Dragging 2D Visitor Avatar
    if (isDraggingVisitor && onUpdateVisitorCamera) {
      const curFloorPlan = screenToPlan(e.clientX, e.clientY, activeFloor, true);
      let minX = -360, maxX = 360, minY = -260, maxY = 260;
      if (floorRooms.length > 0 || floorWalls.length > 0) {
        minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
        floorRooms.forEach((r) => r.points.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }));
        floorWalls.forEach((w) => { minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd); minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd); });
        minX -= 20; maxX += 20; minY -= 20; maxY += 20;
      }

      const clampedX = Math.max(minX, Math.min(maxX, curFloorPlan.x));
      const clampedY = Math.max(minY, Math.min(maxY, curFloorPlan.y));

      if (clampedX !== curFloorPlan.x || clampedY !== curFloorPlan.y) {
        triggerWalkWarning('⚠️ Walk View locked to ' + (activeFloor === 0 ? 'Ground Floor' : '1st Floor') + '. Click a floor tab above to switch floors.');
      }

      onUpdateVisitorCamera({
        x: Math.round(clampedX),
        y: Math.round(clampedY),
        floorLevel: activeFloor,
      });
      return;
    }

    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    // Dragging Selected Furniture
    if (activeFurnitureHandle === 'body' && initialFurnitureState && selectedFurniture) {
      const dx = currentPlan.x - dragStartPos.x;
      const dy = currentPlan.y - dragStartPos.y;
      const updated = plan.furniture.map((f) =>
        f.id === selectedFurniture.id ? { ...f, x: initialFurnitureState.x + dx, y: initialFurnitureState.y + dy } : f
      );
      onUpdatePlan({ ...plan, furniture: updated, updatedAt: new Date().toISOString() });
      return;
    }

    // Dragging Selected Wall
    if (activeWallHandle === 'body' && initialWallState && selectedWall) {
      const dx = currentPlan.x - dragStartPos.x;
      const dy = currentPlan.y - dragStartPos.y;
      const updated = plan.walls.map((w) =>
        w.id === selectedWall.id
          ? {
              ...w,
              xStart: initialWallState.xStart + dx,
              yStart: initialWallState.yStart + dy,
              xEnd: initialWallState.xEnd + dx,
              yEnd: initialWallState.yEnd + dy,
            }
          : w
      );
      onUpdatePlan({ ...plan, walls: updated, updatedAt: new Date().toISOString() });
      return;
    }
  };

  const handleMouseUp = () => {
    setIsDraggingVisitor(false);
    setIsPanning(false);
    setActiveFurnitureHandle(null);
    setActiveWallHandle(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const cursorOffsetX = e.clientX - rect.left - rect.width / 2;
    const cursorOffsetY = e.clientY - rect.top - rect.height / 2;
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

    setScale((prevScale) => {
      const nextScale = Math.min(Math.max(prevScale * zoomFactor, 0.05), 12.0);
      const ratio = nextScale / prevScale;
      setPanOffset((prevPan) => ({
        x: cursorOffsetX - (cursorOffsetX - prevPan.x) * ratio,
        y: cursorOffsetY - (cursorOffsetY - prevPan.y) * ratio,
      }));
      return nextScale;
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* CAD Top Engineering Toolbar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none select-none">
        {/* Left: Complete Architectural & CAD Drafting Tools */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md pointer-events-auto flex-wrap">
          {/* Select Tool */}
          <button
            onClick={() => { setToolMode('select'); setWallStart(null); setDimStart(null); setRoomVertices([]); }}
            className={'p-1.5 rounded-lg text-xs font-semibold transition ' + (toolMode === 'select' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Select & Move (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          {/* Draw Wall */}
          <button
            onClick={() => { setToolMode('drawWall'); setWallStart(null); }}
            className={'p-1.5 rounded-lg text-xs font-semibold transition ' + (toolMode === 'drawWall' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Draw Multi-Segment Walls (W)"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* Room Polygon Builder */}
          <button
            onClick={() => { setToolMode('drawRoom'); setRoomVertices([]); }}
            className={'p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ' + (toolMode === 'drawRoom' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Room Polygon Builder (R) - Click vertices & press Enter"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Room</span>
          </button>

          {/* Door Inserter */}
          <button
            onClick={() => setToolMode('door')}
            className={'p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ' + (toolMode === 'door' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Insert Architectural Door (Click on wall, press F to flip swing)"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Door</span>
          </button>

          {/* Window Inserter */}
          <button
            onClick={() => setToolMode('window')}
            className={'p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ' + (toolMode === 'window' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Insert Double-Glazed Window (Click on wall)"
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Window</span>
          </button>

          {/* Aligned Dimension */}
          <button
            onClick={() => { setToolMode('dimension'); setDimStart(null); }}
            className={'p-1.5 rounded-lg text-xs font-semibold transition ' + (toolMode === 'dimension' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Aligned Dimension Line (D)"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          {/* Auto Dimension All Walls (Toggle On/Off) */}
          <button
            onClick={handleAutoDimension}
            className={
              'p-1.5 rounded-lg text-xs font-semibold transition border ' +
              (floorDimensionLines.length > 0
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200')
            }
            title={
              floorDimensionLines.length > 0
                ? 'Clear Measurements (Click to remove dimensions)'
                : 'Auto-Dimension All Exterior Walls (Click to show measurements)'
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

          {/* Ortho Lock Toggle */}
          <button
            onClick={() => setOrthoLock(!orthoLock)}
            className={'px-2 py-1 rounded-lg text-[11px] font-bold transition border ' + (orthoLock ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')}
            title="Ortho Mode (Hold Shift or toggle for 90° angle lock)"
          >
            ORTHO
          </button>

          {/* Snap Toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={'p-1.5 rounded-lg text-xs transition ' + (snapToGrid ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold' : 'text-slate-500 hover:bg-slate-100')}
            title={'Grid Snap: ' + (snapToGrid ? 'ON' : 'OFF') + ' (' + GRID_SIZE_CM + 'cm)'}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Pan Tool */}
          <button
            onClick={() => { setToolMode('pan'); onSelectId(null); }}
            className={'p-1.5 rounded-lg text-xs transition ' + (toolMode === 'pan' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100')}
            title="Pan Hand Tool (H or Hold Space)"
          >
            <Hand className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Layers & Professional Export Actions */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md pointer-events-auto">
          {/* CAD Layers Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 border border-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Layers</span>
            </button>

            {isLayersMenuOpen && (
              <div className="absolute right-0 top-9 w-52 bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-2 z-30 flex flex-col gap-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">CAD Layer Visibility</span>
                {Object.keys(layers).map((lKey) => {
                  const k = lKey as keyof CADLayers;
                  return (
                    <button
                      key={k}
                      onClick={() => setLayers((prev) => ({ ...prev, [k]: !prev[k] }))}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 cursor-pointer"
                    >
                      <span className="capitalize">{k}</span>
                      {layers[k] ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Export Scalable Vector SVG CAD File"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">SVG</span>
          </button>

          {/* Export 4K HD Blueprint */}
          <button
            onClick={handleExportHDImage}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Export Ultra HD 4K Architectural Blueprint (PNG)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 4K HD</span>
          </button>
        </div>
      </div>

      {/* Walk View Floor Boundary Warning Toast */}
      {walkWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl border border-amber-400 text-xs animate-bounce">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{walkWarning}</span>
        </div>
      )}

      {/* Collision Alert Banner */}
      {collidingItemIds.size > 0 && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-rose-600 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-rose-500 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{collidingItemIds.size} {collidingItemIds.size === 1 ? 'Item' : 'Items'} Overlapping</span>
        </div>
      )}

      {/* Main CAD Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full flex-1 cursor-crosshair touch-none"
      />

      {/* Interactive Delete Button anchored directly near the Selected Room's Label */}
      {selectedRoom && selectedRoomCenterScreen && (
        <div
          style={{
            position: 'absolute',
            left: `${selectedRoomCenterScreen.x + 76}px`,
            top: `${selectedRoomCenterScreen.y}px`,
            transform: 'translateY(-50%)',
          }}
          className="z-30 pointer-events-auto animate-in fade-in zoom-in duration-150"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSelected();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xl transition-all border border-rose-400/80 cursor-pointer"
            title="Delete this Room (or press Delete key)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-md text-xs text-slate-700">
        <button onClick={() => setScale((s) => Math.max(s * 0.8, 0.05))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900" title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-1.5 font-mono text-[11px] min-w-[50px] text-center font-bold text-slate-800">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(s * 1.25, 12.0))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900" title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Helper: Point to Segment Distance
function pointToSegmentDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Helper: Point In Polygon
function isPointInPolygon(p: { x: number; y: number }, pts: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
