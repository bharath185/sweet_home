'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Sun,
  Rotate3d,
  Maximize2,
  Camera,
  AlertTriangle,
  User,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  Compass,
  MapPin,
  RotateCw,
  RotateCcw,
  Trash2,
  Copy,
  Move,
  Layers,
  Palette,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer
} from 'lucide-react';
import { HomePlan, FurnitureItem, Wall, Room, CatalogItem, VisitorCameraState } from '../types/plan';
import { isTabletopItem, autoAttachToTabletop } from '../services/tabletopAttachment';
import { loadObjModel } from '../services/objParser';
import { loadGltfModel, getLocalModelBlob } from '../services/modelLoader';
import { buildSubPartMaterials, mapObjGroupToPartId } from '../services/partMaterials';
import {
  buildTableMeshGroup,
  buildChairMeshGroup,
  buildSofaMeshGroup,
  buildCabinetMeshGroup,
  buildBedMeshGroup,
  buildLampMeshGroup,
  buildShelfMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildWallDesignMeshGroup,
  buildInteriorDecorMeshGroup,
  buildCustomPrimitivesMeshGroup,
  buildStairsMeshGroup,
} from '../services/proceduralFurniture';
import { getProceduralTexture } from '../services/pbrTextures';
import { RenderStudioModal, RenderSnapshotSettings } from './RenderStudioModal';

interface Viewport3DProps {
  plan: HomePlan;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdatePlan?: (plan: HomePlan) => void;
  isCustomerMode?: boolean;
  collidingItemIds?: Set<string>;
  activeFloor?: number;
  floorMode?: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange?: (mode: 'single' | 'sideBySide' | 'stacked') => void;
  onFloorChange?: (floor: number) => void;
  isSplitMode?: boolean;
  cameraModeProp?: 'aerial' | 'visitor';
  onCameraModeChangeProp?: (mode: 'aerial' | 'visitor') => void;
  targetRoomToFocus?: Room | null;
  toolModeProp?: 'select' | 'pan';
  onToolModeChangeProp?: (mode: 'select' | 'pan') => void;
  visitorCameraProp?: VisitorCameraState;
  onVisitorCameraChange?: (state: VisitorCameraState) => void;
}

const CM = 0.01;

function buildSmartArchetypeFallback(
  item: FurnitureItem,
  itemMat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const lowerName = (item.name || '').toLowerCase();
  const lowerCat = (item.category || '').toLowerCase();
  const lowerCatId = (item.catalogId || '').toLowerCase();

  try {
    if (lowerName.includes('chair') || lowerName.includes('armchair') || lowerCatId.includes('chair')) {
      return buildChairMeshGroup(
        {
          seatType: 'cushioned',
          backrestStyle: lowerName.includes('armchair') ? 'wingback' : 'solid_panel',
          legStyle: 'straight_4',
          width: item.width,
          depth: item.depth,
          height: item.height,
          seatHeight: Math.min(45, item.height * 0.5),
        },
        itemMat,
        partMats
      );
    }

    if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('lounge') || lowerCatId.includes('sofa')) {
      return buildSofaMeshGroup(
        {
          type: 'straight_2_seater',
          cushionStyle: 'plump',
          armStyle: 'track_arm',
          legStyle: 'wooden_pegs',
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    if (lowerName.includes('table') || lowerName.includes('desk') || lowerCatId.includes('table')) {
      return buildTableMeshGroup(
        {
          shape: lowerName.includes('round') ? 'round' : 'rectangular',
          legStyle: '4_legs_corner',
          topThickness: 4,
          legThickness: 5,
          bevel: true,
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    if (lowerName.includes('bed') || lowerCat === 'bedroom' || lowerCatId.includes('bed')) {
      return buildBedMeshGroup(
        {
          headboardStyle: 'tufted',
          frameStyle: 'platform',
          width: item.width,
          depth: item.depth,
          height: item.height,
          hasNightstands: false,
        },
        itemMat,
        partMats
      );
    }

    if (lowerCat === 'kitchen' || lowerName.includes('cabinet') || lowerName.includes('wardrobe') || lowerCatId.includes('cabinet')) {
      return buildCabinetMeshGroup(
        {
          columns: 2,
          rows: 2,
          doorType: 'solid_doors',
          width: item.width,
          depth: item.depth,
          height: item.height,
          hasLegs: true,
        },
        itemMat,
        partMats
      );
    }

    if (lowerCat === 'lighting' || lowerName.includes('lamp') || lowerCatId.includes('lamp')) {
      return buildLampMeshGroup(
        {
          type: 'table_lamp',
          shadeWidth: item.width,
          shadeHeight: item.depth,
          totalHeight: item.height,
        },
        itemMat,
        partMats
      );
    }

    if (lowerCat === 'doors & windows' || lowerName.includes('door') || lowerName.includes('window')) {
      if (lowerName.includes('window')) {
        return buildWindowMeshGroup(
          {
            type: 'modern_sliding',
            width: item.width,
            depth: item.depth,
            height: item.height,
          },
          itemMat
        );
      }
      return buildDoorMeshGroup(
        {
          type: 'modern_flush',
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    if (lowerCat === 'stairs' || lowerName.includes('stair') || lowerCatId.includes('stair')) {
      return buildStairsMeshGroup(
        {
          type: lowerName.includes('spiral') ? 'spiral' : 'straight',
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }
  } catch (e) {}

  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(item.width * CM, item.height * CM, item.depth * CM);
  const mesh = new THREE.Mesh(geom, itemMat);
  mesh.position.y = (item.height * CM) / 2;
  grp.add(mesh);
  return grp;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  plan,
  selectedId,
  onSelectId,
  onUpdatePlan,
  isCustomerMode = false,
  collidingItemIds = new Set(),
  activeFloor = 0,
  floorMode,
  onFloorModeChange,
  onFloorChange,
  isSplitMode = false,
  cameraModeProp,
  onCameraModeChangeProp,
  targetRoomToFocus,
  toolModeProp,
  onToolModeChangeProp,
  visitorCameraProp,
  onVisitorCameraChange,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshesGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  const planRef = useRef<HomePlan>(plan);
  planRef.current = plan;
  const onUpdatePlanRef = useRef(onUpdatePlan);
  onUpdatePlanRef.current = onUpdatePlan;
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  // 3D Pick and Drag Placement State
  const isDraggingObjectRef = useRef(false);
  const draggedItemIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const [isHoveringObject, setIsHoveringObject] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  hoveredIdRef.current = hoveredId;

  const pendingClickedItemRef = useRef<{
    id: string;
    type: 'furniture' | 'wall' | 'floorSign' | 'floorPad' | 'roomFloor';
    floorLevel?: number;
  } | null>(null);
  const canDragSelectedItemRef = useRef(false);
  const hasMovedPastThresholdRef = useRef(false);
  const [isDraggingObjectState, setIsDraggingObjectState] = useState(false);
  const [isDragOverCatalog, setIsDragOverCatalog] = useState(false);

  // 3D Tool Mode: 'select' (Select & Drag Furniture) | 'pan' (Free Hand Pan View without moving items)
  const [localToolMode, setLocalToolMode] = useState<'select' | 'pan'>('select');
  const toolMode = toolModeProp !== undefined ? toolModeProp : localToolMode;
  const setToolMode = (mode: 'select' | 'pan') => {
    setLocalToolMode(mode);
    if (onToolModeChangeProp) onToolModeChangeProp(mode);
  };
  const toolModeRef = useRef<'select' | 'pan'>('select');
  toolModeRef.current = toolMode;

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSpacePressedRef = useRef(false);
  const [isPanningState, setIsPanningState] = useState(false);


  // 3D Floor Isolation & Multi-Floor Mode: 'isolated' (Focus Active Floor) | 'stacked' (All Floors) | 'sideBySide' (All Floors Side-by-Side)
  const [localFloor3DMode, setLocalFloor3DMode] = useState<'isolated' | 'stacked' | 'sideBySide'>('isolated');
  const floor3DMode: 'isolated' | 'stacked' | 'sideBySide' =
    floorMode === 'single' ? 'isolated' : (floorMode === 'sideBySide' ? 'sideBySide' : (floorMode === 'stacked' ? 'stacked' : localFloor3DMode));
  const setFloor3DMode = (newMode: 'isolated' | 'stacked' | 'sideBySide') => {
    setLocalFloor3DMode(newMode);
    if (onFloorModeChange) {
      onFloorModeChange(newMode === 'isolated' ? 'single' : newMode);
    }
  };

  // Camera Mode: 'aerial' (orbit) or 'visitor' (human eye level walkthrough at 160cm)
  const [localCameraMode, setLocalCameraMode] = useState<'aerial' | 'visitor'>(
    cameraModeProp || (isCustomerMode ? 'visitor' : 'aerial')
  );
  const cameraMode = cameraModeProp !== undefined ? cameraModeProp : localCameraMode;
  const setCameraMode = (m: 'aerial' | 'visitor') => {
    setLocalCameraMode(m);
    if (m === 'visitor') {
      onSelectId(null);
    }
    if (onCameraModeChangeProp) onCameraModeChangeProp(m);
  };
  // Sync external 2D visitor camera position into 3D
  useEffect(() => {
    if (visitorCameraProp && cameraMode === 'visitor') {
      const newX = (visitorCameraProp.x || 0) * 0.01;
      const newZ = (visitorCameraProp.y || 0) * 0.01;
      if (
        Math.abs(newX - visitorPosRef.current.x) > 0.03 ||
        Math.abs(newZ - visitorPosRef.current.z) > 0.03
      ) {
        visitorPosRef.current.x = newX;
        visitorPosRef.current.z = newZ;
      }
      if (visitorCameraProp.yaw !== undefined && Math.abs(visitorCameraProp.yaw - visitorYawRef.current) > 0.03) {
        visitorYawRef.current = visitorCameraProp.yaw;
      }
      if (visitorCameraProp.floorLevel !== undefined && visitorCameraProp.floorLevel !== activeFloorRef.current && onFloorChange) {
        onFloorChange(visitorCameraProp.floorLevel);
      }
    }
  }, [visitorCameraProp, cameraMode, onFloorChange]);

  const cameraModeRef = useRef<'aerial' | 'visitor'>('aerial');
  cameraModeRef.current = cameraMode;

  useEffect(() => {
    if (cameraMode === 'visitor') {
      onSelectId(null);
    }
  }, [cameraMode]);

  const [timeOfDay, setTimeOfDay] = useState<number>(plan.environment?.timeOfDay || 14.5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRenderStudioOpen, setIsRenderStudioOpen] = useState(false);
  const [walkWarning, setWalkWarning] = useState<string | null>(null);
  const walkWarningRef = useRef<string | null>(null);
  walkWarningRef.current = walkWarning;
  const walkWarningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerWalkWarning = (msg: string) => {
    setWalkWarning(msg);
    if (walkWarningTimerRef.current) clearTimeout(walkWarningTimerRef.current);
    walkWarningTimerRef.current = setTimeout(() => {
      setWalkWarning(null);
    }, 2800);
  };

  // Aerial Orbit State
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetRef = useRef(new THREE.Vector3(0, 1.0, 0));

  // Floor Mode and Active Floor Refs
  const floor3DModeRef = useRef(floor3DMode);
  floor3DModeRef.current = floor3DMode;

  const activeFloorRef = useRef(activeFloor);
  activeFloorRef.current = activeFloor;

  const getFloor3DOffset = (level: number = 0, currentFloorMode = floor3DModeRef.current) => {
    const allFloors = planRef.current.floors && planRef.current.floors.length > 0 ? planRef.current.floors : [
      { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
      { level: 1, name: '1st Floor', height: 250, elevation: 250 },
    ];
    if (currentFloorMode === 'isolated') {
      return { x: 0, y: 0, z: 0 };
    } else if (currentFloorMode === 'sideBySide') {
      const floorIdx = allFloors.findIndex((fl) => fl.level === level);
      const validIdx = floorIdx >= 0 ? floorIdx : 0;
      const mid = (allFloors.length - 1) / 2;
      return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
    } else {
      return { x: 0, y: level * 2.5, z: 0 };
    }
  };

  // Virtual Visitor State (Human eye level 1.6m above active floor)
  const visitorPosRef = useRef(new THREE.Vector3(0, 1.6, 0));
  const visitorYawRef = useRef(0);
  const lastSentPosRef = useRef<{ x: number; y: number; yaw: number }>({ x: 0, y: 0, yaw: 0 });
  const visitorPitchRef = useRef(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Initialize Three.js WebGL Scene ONCE
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e2e8f0');
    scene.fog = new THREE.FogExp2('#e2e8f0', 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.02, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.85);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff8eb, 1.7);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const groundGeom = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0xcbd5e1);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);
    meshesGroupRef.current = meshesGroup;

    // Keyboard handlers for WASD Virtual Visitor navigation & selected furniture manipulation
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input/textarea, ignore
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Spacebar for Free Hand Pan Mode
      if (e.code === 'Space' && !e.repeat) {
        isSpacePressedRef.current = true;
        setIsSpacePressed(true);
      }
      // 'H' key toggles Free Hand tool
      if (e.code === 'KeyH') {
        const next = toolModeRef.current === 'pan' ? 'select' : 'pan';
        toolModeRef.current = next;
        setToolMode(next);
      }
      // 'V' key or Escape returns to Select tool
      if (e.code === 'KeyV' || e.code === 'Escape') {
        toolModeRef.current = 'select';
        setToolMode('select');
      }

      keysPressedRef.current[e.code] = true;

      const selId = selectedIdRef.current;
      const currentPlan = planRef.current;
      const updatePlan = onUpdatePlanRef.current;

      if (selId && updatePlan) {
        const item = currentPlan.furniture.find((f) => f.id === selId);
        if (item) {
          // 'R' -> Rotate 45 deg
          if (e.code === 'KeyR') {
            e.preventDefault();
            const angleDelta = e.shiftKey ? -Math.PI / 4 : Math.PI / 4;
            const newAngle = ((item.angle || 0) + angleDelta + Math.PI * 2) % (Math.PI * 2);
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId ? { ...f, angle: newAngle } : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // '+' or '=' -> Scale Up 10%
          if (e.code === 'Equal' || e.code === 'NumpadAdd') {
            e.preventDefault();
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId
                  ? {
                      ...f,
                      width: Math.round(f.width * 1.1),
                      depth: Math.round(f.depth * 1.1),
                      height: Math.round(f.height * 1.1),
                    }
                  : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // '-' or '_' -> Scale Down 10%
          if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
            e.preventDefault();
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId
                  ? {
                      ...f,
                      width: Math.max(10, Math.round(f.width * 0.9)),
                      depth: Math.max(10, Math.round(f.depth * 0.9)),
                      height: Math.max(10, Math.round(f.height * 0.9)),
                    }
                  : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // 'Delete' or 'Backspace' -> Remove item
          if (e.code === 'Delete' || e.code === 'Backspace') {
            e.preventDefault();
            if (item.isLocked) {
              alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
              return;
            }
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.filter((f) => f.id !== selId),
              updatedAt: new Date().toISOString(),
            });
            onSelectId(null);
          }

          // Arrow Keys in Aerial Mode -> Nudge item
          if (cameraModeRef.current === 'aerial') {
            const NUDGE = e.shiftKey ? 50 : 10; // cm
            let dx = 0;
            let dy = 0;
            if (e.code === 'ArrowUp') dy = -NUDGE;
            if (e.code === 'ArrowDown') dy = NUDGE;
            if (e.code === 'ArrowLeft') dx = -NUDGE;
            if (e.code === 'ArrowRight') dx = NUDGE;

            if (dx !== 0 || dy !== 0) {
              e.preventDefault();
              updatePlan({
                ...currentPlan,
                furniture: currentPlan.furniture.map((f) =>
                  f.id === selId ? { ...f, x: f.x + dx, y: f.y + dy } : f
                ),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Continuous Animation & Camera Update Loop
    let animationId: number;
    let clock = new THREE.Clock();

    // Initial visitor position setup from room center
    const initialTargetRoom = planRef.current.rooms.find((r) => (r.floorLevel ?? 0) === (activeFloor ?? 0)) || planRef.current.rooms[0];
    if (initialTargetRoom && initialTargetRoom.points.length > 0) {
      const avgX = (initialTargetRoom.points.reduce((acc, p) => acc + p.x, 0) / initialTargetRoom.points.length) * 0.01;
      const avgZ = (initialTargetRoom.points.reduce((acc, p) => acc + p.y, 0) / initialTargetRoom.points.length) * 0.01;
      visitorPosRef.current.set(avgX, 1.6, avgZ);
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const mode = cameraModeRef.current;

      if (mode === 'visitor') {
        // Continuous keyboard movement in Virtual Visitor mode
        const speed = keysPressedRef.current['ShiftLeft'] ? 6.0 : 3.0; // m/s
        const moveDist = speed * delta;

        const forward = new THREE.Vector3(
          Math.sin(visitorYawRef.current),
          0,
          -Math.cos(visitorYawRef.current)
        );
        const right = new THREE.Vector3(
          Math.cos(visitorYawRef.current),
          0,
          Math.sin(visitorYawRef.current)
        );

        if (keysPressedRef.current['KeyW'] || keysPressedRef.current['ArrowUp']) {
          visitorPosRef.current.addScaledVector(forward, moveDist);
        }
        if (keysPressedRef.current['KeyS'] || keysPressedRef.current['ArrowDown']) {
          visitorPosRef.current.addScaledVector(forward, -moveDist);
        }
        if (keysPressedRef.current['KeyA']) {
          visitorPosRef.current.addScaledVector(right, -moveDist);
        }
        if (keysPressedRef.current['KeyD']) {
          visitorPosRef.current.addScaledVector(right, moveDist);
        }
        if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['KeyQ']) {
          visitorYawRef.current += 1.8 * delta;
        }
        if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['KeyE']) {
          visitorYawRef.current -= 1.8 * delta;
        }

        // Apply Visitor Camera Position & Look Direction with exact 3D Floor Offset strictly on activeFloor
        const curLevel = activeFloorRef.current ?? 0;
        const curOffset = getFloor3DOffset(curLevel);

        // Clamp visitor position within active floor boundary in 3D
        const flRooms = planRef.current.rooms.filter((r) => (r.floorLevel ?? 0) === curLevel);
        const flWalls = planRef.current.walls.filter((w) => (w.floorLevel ?? 0) === curLevel);
        let fMinX = -3.8, fMaxX = 3.8, fMinZ = -2.8, fMaxZ = 2.8;
        if (flRooms.length > 0 || flWalls.length > 0) {
          fMinX = Infinity; fMaxX = -Infinity; fMinZ = Infinity; fMaxZ = -Infinity;
          flRooms.forEach((r) => {
            r.points.forEach((p) => {
              fMinX = Math.min(fMinX, p.x * 0.01);
              fMaxX = Math.max(fMaxX, p.x * 0.01);
              fMinZ = Math.min(fMinZ, p.y * 0.01);
              fMaxZ = Math.max(fMaxZ, p.y * 0.01);
            });
          });
          flWalls.forEach((w) => {
            fMinX = Math.min(fMinX, w.xStart * 0.01, w.xEnd * 0.01);
            fMaxX = Math.max(fMaxX, w.xStart * 0.01, w.xEnd * 0.01);
            fMinZ = Math.min(fMinZ, w.yStart * 0.01, w.yEnd * 0.01);
            fMaxZ = Math.max(fMaxZ, w.yStart * 0.01, w.yEnd * 0.01);
          });
          fMinX -= 0.2; fMaxX += 0.2; fMinZ -= 0.2; fMaxZ += 0.2;
        }

        const rawVx = visitorPosRef.current.x;
        const rawVz = visitorPosRef.current.z;
        const clampedVx = Math.max(fMinX, Math.min(fMaxX, rawVx));
        const clampedVz = Math.max(fMinZ, Math.min(fMaxZ, rawVz));

        if (clampedVx !== rawVx || clampedVz !== rawVz) {
          visitorPosRef.current.x = clampedVx;
          visitorPosRef.current.z = clampedVz;
          if (!walkWarningRef.current) {
            triggerWalkWarning(`⚠️ Walk View locked to ${curLevel === 0 ? 'Ground Floor' : '1st Floor'}. Please switch floor in top bar to walk other levels.`);
          }
        }

        const vp = visitorPosRef.current;
        camera.position.set(
          vp.x + curOffset.x,
          curOffset.y + 1.6,
          vp.z + curOffset.z
        );

        const lookDir = new THREE.Vector3(
          Math.sin(visitorYawRef.current) * Math.cos(visitorPitchRef.current),
          Math.sin(visitorPitchRef.current),
          -Math.cos(visitorYawRef.current) * Math.cos(visitorPitchRef.current)
        );
        camera.lookAt(camera.position.clone().add(lookDir));

        // Real-time synchronization to 2D Floorplan view
        if (onVisitorCameraChange) {
          const cmX = Math.round(vp.x * 100);
          const cmY = Math.round(vp.z * 100);
          const curYaw = visitorYawRef.current;
          if (
            Math.abs(cmX - lastSentPosRef.current.x) >= 1 ||
            Math.abs(cmY - lastSentPosRef.current.y) >= 1 ||
            Math.abs(curYaw - lastSentPosRef.current.yaw) >= 0.015
          ) {
            lastSentPosRef.current = { x: cmX, y: cmY, yaw: curYaw };
            onVisitorCameraChange({
              x: cmX,
              y: cmY,
              yaw: curYaw,
              elevation: 160,
              floorLevel: curLevel,
            });
          }
        }
      } else {
        // Apply Aerial Orbit Camera Position
        const s = sphericalRef.current;
        const x = targetRef.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        const y = targetRef.current.y + s.radius * Math.cos(s.phi);
        const z = targetRef.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
        camera.position.set(x, y, z);
        camera.lookAt(targetRef.current);
      }

      // ----------------------------------------------------
      // PROXIMITY DOOR & WINDOW ANIMATION ENGINE
      // ----------------------------------------------------
      const isVisitorMode = mode === 'visitor';
      const camPos = camera.position;
      const worldPosVec = new THREE.Vector3();

      meshesGroup.traverse((obj) => {
        if (obj.userData && obj.userData.isInteractive && Array.isArray(obj.userData.animParts)) {
          obj.getWorldPosition(worldPosVec);
          const dist = Math.hypot(camPos.x - worldPosVec.x, camPos.z - worldPosVec.z);
          // Trigger when camera is within 2.3 meters in Virtual Tour mode
          const shouldBeOpen = isVisitorMode && dist < 2.3;

          obj.userData.animParts.forEach((part: THREE.Object3D) => {
            if (part && part.userData) {
              part.userData.targetProgress = shouldBeOpen ? 1.0 : 0.0;

              const cur = part.userData.currentProgress || 0;
              const tgt = part.userData.targetProgress;
              const step = Math.min(1.0, delta * 5.0); // Smooth 60fps spring interpolation
              const next = cur + (tgt - cur) * step;
              part.userData.currentProgress = next;

              if (
                part.userData.animType === 'hinge_single' ||
                part.userData.animType === 'hinge_left' ||
                part.userData.animType === 'hinge_right'
              ) {
                part.rotation.y = part.userData.openRotation * next;
              } else if (part.userData.animType === 'slide_x') {
                part.position.x = part.userData.slideDist * next;
              }
            }
          });
        }
      });

      // Pulse animation for colliding items
      const elapsedTime = clock.getElapsedTime();
      meshesGroup.traverse((child) => {
        if (child.userData && child.userData.isColliding && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 6) * 0.4;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Synchronize visitor position when switching activeFloor
  useEffect(() => {
    // If external visitorCamera already has a position on this activeFloor, preserve it
    if (visitorCameraProp && (visitorCameraProp.floorLevel === activeFloor || visitorCameraProp.floorLevel === undefined)) {
      const curX = (visitorCameraProp.x || 0) * 0.01;
      const curZ = (visitorCameraProp.y || 0) * 0.01;
      visitorPosRef.current.set(curX, 1.6, curZ);
      return;
    }

    const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === (activeFloor ?? 0)) || plan.rooms[0];
    let initX = 0;
    let initZ = 0;
    if (targetRoom && targetRoom.points.length > 0) {
      initX = (targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length) * 0.01;
      initZ = (targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length) * 0.01;
    }
    visitorPosRef.current.set(initX, 1.6, initZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
    lastSentPosRef.current = { x: Math.round(initX * 100), y: Math.round(initZ * 100), yaw: 0 };

    if (onVisitorCameraChange) {
      onVisitorCameraChange({
        x: Math.round(initX * 100),
        y: Math.round(initZ * 100),
        yaw: 0,
        elevation: 160,
        floorLevel: activeFloor,
      });
    }
  }, [activeFloor]);

  // Update Sunlight & Atmospheric Sky based on Time of Day
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;

    const sunAngle = ((timeOfDay - 6) / 18) * Math.PI;
    const isDay = timeOfDay >= 5.5 && timeOfDay <= 19.5;

    if (isDay) {
      const sunY = Math.max(0.1, Math.sin(sunAngle) * 35);
      const sunX = Math.cos(sunAngle) * 35;
      dirLightRef.current.position.set(sunX, sunY, 15);

      if (timeOfDay < 8) {
        // Dawn / Early Morning: soft peach-rose sunrise
        dirLightRef.current.color.setHex(0xffaa77);
        dirLightRef.current.intensity = 1.3;
        hemiLightRef.current.color.setHex(0xffedd5);
        hemiLightRef.current.groundColor.setHex(0x64748b);
        hemiLightRef.current.intensity = 0.75;
        sceneRef.current.background = new THREE.Color('#fed7aa');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#fed7aa');
      } else if (timeOfDay > 17) {
        // Golden Hour / Sunset: rich golden amber light
        dirLightRef.current.color.setHex(0xf59e0b);
        dirLightRef.current.intensity = 1.4;
        hemiLightRef.current.color.setHex(0xfef3c7);
        hemiLightRef.current.groundColor.setHex(0x475569);
        hemiLightRef.current.intensity = 0.8;
        sceneRef.current.background = new THREE.Color('#fdba74');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#fdba74');
      } else {
        // High Noon / Daylight: crisp natural sun
        dirLightRef.current.color.setHex(0xffffff);
        dirLightRef.current.intensity = 1.75;
        hemiLightRef.current.color.setHex(0xffffff);
        hemiLightRef.current.groundColor.setHex(0x94a3b8);
        hemiLightRef.current.intensity = 0.9;
        sceneRef.current.background = new THREE.Color('#e2e8f0');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#e2e8f0');
      }
    } else {
      // Night / Twilight: cool deep midnight blue moonlight
      dirLightRef.current.position.set(-15, 25, -15);
      dirLightRef.current.color.setHex(0x60a5fa);
      dirLightRef.current.intensity = 0.45;
      hemiLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.35;
      sceneRef.current.background = new THREE.Color('#030712');
      if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#030712');
    }
  }, [timeOfDay]);

  // Build & Update 3D Meshes from Plan (with COLLISION RED GLOW)
  useEffect(() => {
    const group = meshesGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const CM = 0.01;
    const targetFloor = activeFloor ?? 0;

    const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
      { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
      { level: 1, name: '1st Floor', height: 250, elevation: 250 },
    ];

    // Helper for 3D floor placement: side-by-side horizontal positioning or stacked
    const getFloor3DOffset = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return { x: 0, y: 0, z: 0 };
      } else if (floor3DMode === 'sideBySide') {
        const floorIdx = allFloors.findIndex((fl) => fl.level === level);
        const validIdx = floorIdx >= 0 ? floorIdx : 0;
        const mid = (allFloors.length - 1) / 2;
        // 13.0 meters horizontal spacing side-by-side on ground level
        return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
      } else {
        // Stacked vertically
        return { x: 0, y: level * 2.5, z: 0 };
      }
    };

    const isFloorVisible = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return level === targetFloor;
      }
      return true;
    };

    // 0. Build Foundation Plates & Clear Floor Title Placards in 3D
    allFloors.forEach((fl) => {
      if (!isFloorVisible(fl.level)) return;
      const offset = getFloor3DOffset(fl.level);
      const floorRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === fl.level);
      const floorWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === fl.level);

      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      floorRooms.forEach((r) => {
        r.points.forEach((p) => {
          minX = Math.min(minX, p.x * CM);
          maxX = Math.max(maxX, p.x * CM);
          minZ = Math.min(minZ, p.y * CM);
          maxZ = Math.max(maxZ, p.y * CM);
        });
      });
      floorWalls.forEach((w) => {
        minX = Math.min(minX, w.xStart * CM, w.xEnd * CM);
        maxX = Math.max(maxX, w.xStart * CM, w.xEnd * CM);
        minZ = Math.min(minZ, w.yStart * CM, w.yEnd * CM);
        maxZ = Math.max(maxZ, w.yStart * CM, w.yEnd * CM);
      });

      if (minX === Infinity) {
        minX = -3.5; maxX = 3.5; minZ = -3.5; maxZ = 3.5;
      }

      const padW = Math.max(7, (maxX - minX) + 2.0);
      const padD = Math.max(7, (maxZ - minZ) + 2.0);
      const centerX = (minX + maxX) / 2 + offset.x;
      const centerZ = (minZ + maxZ) / 2 + offset.z;

      // Base Ground Foundation Slab
      const padGeom = new THREE.BoxGeometry(padW, 0.06, padD);
      const padMat = new THREE.MeshStandardMaterial({
        color: fl.level === 0 ? 0xf1f5f9 : 0xe2e8f0,
        roughness: 0.9,
        metalness: 0.05,
      });
      const padMesh = new THREE.Mesh(padGeom, padMat);
      padMesh.position.set(centerX, offset.y - 0.03, centerZ);
      padMesh.receiveShadow = true;
      padMesh.userData = { id: `floor_pad_${fl.level}`, type: 'floorPad', floorLevel: fl.level };
      group.add(padMesh);

      // High-Definition 3D Floor Placard Signboard with ACTIVE indicator and floor click metadata
      const isCurActive = (targetFloor === fl.level);
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 2048;
      labelCanvas.height = 512;
      const lctx = labelCanvas.getContext('2d');
      if (lctx) {
        lctx.imageSmoothingEnabled = true;
        lctx.imageSmoothingQuality = 'high';

        // Outer ambient drop shadow
        lctx.shadowColor = isCurActive ? 'rgba(2, 132, 199, 0.6)' : 'rgba(15, 23, 42, 0.35)';
        lctx.shadowBlur = isCurActive ? 36 : 24;
        lctx.shadowOffsetY = 10;

        if (isCurActive) {
          const grad = lctx.createLinearGradient(0, 0, 2048, 512);
          if (fl.level === 0) {
            grad.addColorStop(0, '#0284c7');
            grad.addColorStop(1, '#0369a1');
          } else if (fl.level === 1) {
            grad.addColorStop(0, '#059669');
            grad.addColorStop(1, '#047857');
          } else {
            grad.addColorStop(0, '#6366f1');
            grad.addColorStop(1, '#4f46e5');
          }
          lctx.fillStyle = grad;
        } else {
          lctx.fillStyle = '#334155';
        }

        lctx.beginPath();
        lctx.roundRect(32, 32, 1984, 448, 64);
        lctx.fill();

        // Crisp Border
        lctx.shadowColor = 'transparent';
        lctx.strokeStyle = isCurActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)';
        lctx.lineWidth = isCurActive ? 22 : 12;
        lctx.beginPath();
        lctx.roundRect(32, 32, 1984, 448, 64);
        lctx.stroke();

        // Floor Name Title
        lctx.fillStyle = '#ffffff';
        lctx.font = 'bold 110px system-ui, -apple-system, sans-serif';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        const rawName = (fl.name || '').split('(')[0].trim().toUpperCase();
        const baseTitle = fl.level === 0 ? '🏢 GROUND FLOOR' : fl.level === 1 ? '🏡 1ST FLOOR' : `🏡 ${rawName || `FLOOR ${fl.level}`}`;
        const floorTitle = isCurActive ? `● ${baseTitle} (ACTIVE)` : baseTitle;
        lctx.fillText(floorTitle, 1024, 256);

        const labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.generateMipmaps = true;
        labelTex.minFilter = THREE.LinearMipmapLinearFilter;
        labelTex.magFilter = THREE.LinearFilter;
        labelTex.anisotropy = 16;
        labelTex.needsUpdate = true;

        const placardW = 4.2;
        const placardH = placardW * (512 / 2048);
        const labelGeom = new THREE.PlaneGeometry(placardW, placardH);
        const labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(centerX, offset.y + 0.35, maxZ + offset.z + 1.2);
        labelMesh.rotation.x = -Math.PI / 4; // Angled 45 deg upward toward camera
        labelMesh.userData = { id: `floor_sign_${fl.level}`, type: 'floorSign', floorLevel: fl.level };
        group.add(labelMesh);
      }
    });

    // 1. Build Rooms (Floors)
    plan.rooms.filter((r) => isFloorVisible(r.floorLevel ?? 0)).forEach((room) => {
      if (room.points.length < 3) return;
      const offset = getFloor3DOffset(room.floorLevel ?? 0);

      const shape = new THREE.Shape();
      shape.moveTo(room.points[0].x * CM, -room.points[0].y * CM);
      for (let i = 1; i < room.points.length; i++) {
        shape.lineTo(room.points[i].x * CM, -room.points[i].y * CM);
      }
      shape.closePath();

      const geom = new THREE.ShapeGeometry(shape);
      const floorTex = room.floorTexture ? getProceduralTexture(room.floorTexture, room.floorColor) : null;
      const mat = new THREE.MeshStandardMaterial({
        color: room.floorColor ? new THREE.Color(room.floorColor) : 0xd8b48f,
        roughness: room.floorTexture?.includes('marble') ? 0.2 : 0.65,
        metalness: room.floorTexture?.includes('marble') ? 0.08 : 0.03,
        map: floorTex || undefined,
      });

      const floorMesh = new THREE.Mesh(geom, mat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(offset.x, offset.y + 0.005, offset.z);
      floorMesh.receiveShadow = true;
      floorMesh.userData = { id: room.id, type: 'roomFloor', floorLevel: room.floorLevel ?? 0 };
      group.add(floorMesh);
    });

    // 2. Build Walls with Architectural Openings / Cutouts for Doors & Windows
    plan.walls.filter((w) => isFloorVisible(w.floorLevel ?? 0)).forEach((wall) => {
      const offset = getFloor3DOffset(wall.floorLevel ?? 0);
      const x1 = wall.xStart * CM;
      const z1 = wall.yStart * CM;
      const x2 = wall.xEnd * CM;
      const z2 = wall.yEnd * CM;

      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      const height = (wall.height || 250) * CM;
      const thickness = (wall.thickness || 15) * CM;
      const isSelected = selectedId === wall.id;

      const wallTex = wall.texture ? getProceduralTexture(wall.texture, wall.color) : null;
      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : wall.color ? new THREE.Color(wall.color) : 0xf8fafc,
        roughness: 0.85,
        metalness: 0.02,
        map: wallTex || undefined,
      });

      // Find any doors or windows placed along this wall
      const wallFloor = wall.floorLevel ?? 0;
      const wallOpenings = plan.furniture.filter((f) => {
        if ((f.floorLevel ?? 0) !== wallFloor) return false;
        const isOpening =
          f.category === 'Doors & Windows' ||
          (f.name || '').toLowerCase().includes('door') ||
          (f.name || '').toLowerCase().includes('window');
        if (!isOpening) return false;

        // Project opening position onto wall line
        const fx = f.x * CM;
        const fz = f.y * CM;
        const d = Math.abs((x2 - x1) * (z1 - fz) - (x1 - fx) * (z2 - z1)) / length;
        if (d > 0.45) return false; // More than 45cm away from wall centerline

        const dot = ((fx - x1) * dx + (fz - z1) * dz) / (length * length);
        return dot >= -0.05 && dot <= 1.05;
      });

      if (wallOpenings.length === 0) {
        // Solid wall segment
        const geom = new THREE.BoxGeometry(length, height, thickness);
        const wallMesh = new THREE.Mesh(geom, mat);
        wallMesh.position.set(
          (x1 + x2) / 2 + offset.x,
          offset.y + height / 2,
          (z1 + z2) / 2 + offset.z
        );
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallMesh.userData = { id: wall.id, type: 'wall', floorLevel: wallFloor };
        group.add(wallMesh);
      } else {
        // Build wall segments with cutouts (Left sub-wall, Right sub-wall, and Top Lintel above opening)
        // Sort openings by distance along wall from start point
        const sortedOpenings = wallOpenings.map((op) => {
          const fx = op.x * CM;
          const fz = op.y * CM;
          const distAlong = Math.max(0, Math.min(length, ((fx - x1) * dx + (fz - z1) * dz) / length));
          const opWidth = (op.width || 90) * CM;
          const opHeight = (op.height || 210) * CM;
          const opElevation = (op.elevation || 0) * CM;
          return {
            distAlong,
            start: Math.max(0, distAlong - opWidth / 2),
            end: Math.min(length, distAlong + opWidth / 2),
            height: opHeight,
            elevation: opElevation,
          };
        }).sort((a, b) => a.start - b.start);

        const wallGroup = new THREE.Group();
        wallGroup.position.set(x1 + offset.x, offset.y, z1 + offset.z);
        wallGroup.rotation.y = -angle;
        wallGroup.userData = { id: wall.id, type: 'wall', floorLevel: wallFloor };

        let curPos = 0;
        sortedOpenings.forEach((op) => {
          // Left solid section
          const leftLen = op.start - curPos;
          if (leftLen > 0.05) {
            const leftGeom = new THREE.BoxGeometry(leftLen, height, thickness);
            const leftMesh = new THREE.Mesh(leftGeom, mat);
            leftMesh.position.set(curPos + leftLen / 2, height / 2, 0);
            leftMesh.castShadow = true;
            leftMesh.receiveShadow = true;
            wallGroup.add(leftMesh);
          }

          // Top Header / Lintel above door or window opening
          const openLen = op.end - op.start;
          const lintelH = Math.max(0, height - (op.elevation + op.height));
          if (lintelH > 0.04 && openLen > 0.05) {
            const lintelGeom = new THREE.BoxGeometry(openLen, lintelH, thickness);
            const lintelMesh = new THREE.Mesh(lintelGeom, mat);
            lintelMesh.position.set(op.start + openLen / 2, (op.elevation + op.height) + lintelH / 2, 0);
            lintelMesh.castShadow = true;
            lintelMesh.receiveShadow = true;
            wallGroup.add(lintelMesh);
          }

          // Bottom Sill (for windows with elevation above floor)
          if (op.elevation > 0.05 && openLen > 0.05) {
            const sillGeom = new THREE.BoxGeometry(openLen, op.elevation, thickness);
            const sillMesh = new THREE.Mesh(sillGeom, mat);
            sillMesh.position.set(op.start + openLen / 2, op.elevation / 2, 0);
            sillMesh.castShadow = true;
            sillMesh.receiveShadow = true;
            wallGroup.add(sillMesh);
          }

          curPos = op.end;
        });

        // Final solid section to wall end
        const remLen = length - curPos;
        if (remLen > 0.05) {
          const remGeom = new THREE.BoxGeometry(remLen, height, thickness);
          const remMesh = new THREE.Mesh(remGeom, mat);
          remMesh.position.set(curPos + remLen / 2, height / 2, 0);
          remMesh.castShadow = true;
          remMesh.receiveShadow = true;
          wallGroup.add(remMesh);
        }

        group.add(wallGroup);
      }
    });

    // 3. Build Furniture Items (with VIBRANT RED GLOW on Collision)
    plan.furniture.filter((f) => isFloorVisible(f.floorLevel ?? 0)).forEach((item) => {
      if (item.isVisible === false) return;

      const isSelected = selectedId === item.id;
      const isColliding = collidingItemIds.has(item.id);
      const offset = getFloor3DOffset(item.floorLevel ?? 0);

      const isCeiling =
        item.placementType === 'ceiling' ||
        (item.category || '').toLowerCase().includes('ceiling') ||
        (item.name || '').toLowerCase().includes('pendant') ||
        (item.name || '').toLowerCase().includes('chandelier') ||
        (item.name || '').toLowerCase().includes('ceiling fan') ||
        (item.name || '').toLowerCase().includes('downlight') ||
        (item.name || '').toLowerCase().includes('flush light') ||
        (item.name || '').toLowerCase().includes('flush panel');

      const floorHeightCm = 250; // standard floor ceiling height
      let effectiveElevation = item.elevation !== undefined ? item.elevation : 0;
      if (isCeiling && (!item.elevation || item.elevation < 50)) {
        // Automatically mount ceiling fixtures to ceiling height (250cm - height)
        effectiveElevation = Math.max(120, floorHeightCm - (item.height || 50));
      }

      const itemGroup = new THREE.Group();
      itemGroup.position.set(
        item.x * CM + offset.x,
        offset.y + effectiveElevation * CM,
        item.y * CM + offset.z
      );

      // If ceiling fixture and hanging with gap to ceiling, render suspension wire & ceiling mount plate
      if (isCeiling) {
        const topOfItemCm = effectiveElevation + (item.height || 50);
        const gapToCeilingCm = Math.max(0, floorHeightCm - topOfItemCm);
        if (gapToCeilingCm > 2) {
          const cableH = gapToCeilingCm * CM;
          const cableGeom = new THREE.CylinderGeometry(0.003, 0.003, cableH, 8);
          const cableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
          const cableMesh = new THREE.Mesh(cableGeom, cableMat);
          cableMesh.position.set(0, (item.height * CM) + cableH / 2, 0);
          itemGroup.add(cableMesh);

          const canopyGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.015, 16);
          const canopyMesh = new THREE.Mesh(canopyGeom, cableMat);
          canopyMesh.position.set(0, (item.height * CM) + cableH, 0);
          itemGroup.add(canopyMesh);
        }
      }
      itemGroup.rotation.y = -(item.angle || 0);
      itemGroup.userData = { id: item.id, type: 'furniture', floorLevel: item.floorLevel ?? 0, isColliding };

      let itemMat: THREE.MeshStandardMaterial;
      const baseColor = item.color || (item.category === 'Doors & Windows' ? '#fef08a' : '#94a3b8');
      const itemRoughness = item.roughness !== undefined ? item.roughness : 0.4;
      const itemMetalness = item.metalness !== undefined ? item.metalness : 0.15;
      const itemOpacity = item.opacity !== undefined ? item.opacity : 1.0;
      const isTransparent = itemOpacity < 1.0;

      if (isColliding) {
        itemMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xff0000,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.5,
        });
      } else if (isSelected) {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
          emissive: new THREE.Color(0x4f46e5),
          emissiveIntensity: 0.35,
        });
      } else if (hoveredId === item.id) {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
          emissive: new THREE.Color(0x38bdf8),
          emissiveIntensity: 0.3,
        });
      } else {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
        });
      }

      const partMats = buildSubPartMaterials(item, itemMat);
      const hasPartColors = !!(item.partColors && Object.keys(item.partColors).length > 0);

      if (item.model && item.model.startsWith('procedural:')) {
        try {
          const parts = item.model.split(':');
          const pType = parts[1];
          const rawParams = parts.slice(2).join(':');
          const parsed = rawParams ? JSON.parse(rawParams) : {};

          let procGroup: THREE.Group | null = null;
          if (pType === 'table') {
            procGroup = buildTableMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'chair') {
            procGroup = buildChairMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'sofa') {
            procGroup = buildSofaMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'cabinet') {
            procGroup = buildCabinetMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'bed') {
            procGroup = buildBedMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'lamp') {
            procGroup = buildLampMeshGroup({ ...parsed, shadeWidth: item.width, shadeHeight: item.depth, totalHeight: item.height }, itemMat, partMats);
          } else if (pType === 'shelf') {
            procGroup = buildShelfMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'door') {
            procGroup = buildDoorMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'window') {
            procGroup = buildWindowMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'wallDesign') {
            procGroup = buildWallDesignMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'decor') {
            procGroup = buildInteriorDecorMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'stairs' || pType === 'staircase') {
            procGroup = buildStairsMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
          } else if (pType === 'primitives' && parsed.primitives) {
            procGroup = buildCustomPrimitivesMeshGroup(parsed.primitives, itemMat);
          }

          if (procGroup) {
            procGroup.userData = { isColliding };
            itemGroup.add(procGroup);
          } else {
            const geom = new THREE.BoxGeometry(item.width * CM, item.height * CM, item.depth * CM);
            const mesh = new THREE.Mesh(geom, itemMat);
            mesh.position.y = (item.height * CM) / 2;
            itemGroup.add(mesh);
          }
        } catch (e) {
          const geom = new THREE.BoxGeometry(item.width * CM, item.height * CM, item.depth * CM);
          const mesh = new THREE.Mesh(geom, itemMat);
          mesh.position.y = (item.height * CM) / 2;
          itemGroup.add(mesh);
        }
      } else if (item.model && (item.model.endsWith('.glb') || item.model.endsWith('.gltf') || item.model.startsWith('blob_model:') || item.model.includes('.glb?') || item.model.includes('.gltf?'))) {
        const tempFallback = buildSmartArchetypeFallback(item, itemMat, partMats);
        tempFallback.name = 'temp_fallback';
        tempFallback.userData = { isColliding };
        itemGroup.add(tempFallback);

        const modelUrl = item.model.startsWith('blob_model:') ? getLocalModelBlob(item.model) || item.model : item.model;
        loadGltfModel(modelUrl, item.width, item.depth, item.height)
          .then((gltfGroup) => {
            gltfGroup.userData = { isColliding };
            const existingFallback = itemGroup.getObjectByName('temp_fallback');
            if (existingFallback) {
              itemGroup.remove(existingFallback);
            }
            itemGroup.add(gltfGroup);
          })
          .catch((err) => {
            console.warn('GLTF load failed, keeping fallback:', err);
          });
      } else if (item.model && (item.model.endsWith('.obj') || item.model.startsWith('local_obj:') || item.model.startsWith('data:'))) {
        // Immediate smart archetype fallback while real high-poly OBJ model is loading
        const tempFallback = buildSmartArchetypeFallback(item, itemMat, partMats);
        tempFallback.name = 'temp_fallback';
        tempFallback.userData = { isColliding };
        itemGroup.add(tempFallback);

        loadObjModel(item.model).then((objModel) => {
          const targetW = item.width * CM;
          const targetD = item.depth * CM;
          const targetH = item.height * CM;

          const scaleX = objModel.size.x > 0 ? targetW / objModel.size.x : targetW;
          const scaleY = objModel.size.y > 0 ? targetH / objModel.size.y : targetH;
          const scaleZ = objModel.size.z > 0 ? targetD / objModel.size.z : targetD;

          const realObjGroup = new THREE.Group();
          realObjGroup.userData = { isColliding };

          objModel.parts.forEach((part) => {
            const mappedPartId = mapObjGroupToPartId(part.groupName, item.category, item.name);
            const partMaterial = (partMats && mappedPartId && partMats[mappedPartId]) || itemMat;

            const partMesh = new THREE.Mesh(part.geometry, partMaterial);
            partMesh.castShadow = true;
            partMesh.receiveShadow = true;
            partMesh.userData = { partId: mappedPartId, groupName: part.groupName, isColliding };
            realObjGroup.add(partMesh);
          });

          realObjGroup.scale.set(scaleX, scaleY, scaleZ);
          realObjGroup.position.y = targetH / 2;

          // Remove temp fallback and add real multi-part high-detail OBJ model
          const existingFallback = itemGroup.getObjectByName('temp_fallback');
          if (existingFallback) {
            itemGroup.remove(existingFallback);
          }
          itemGroup.add(realObjGroup);
        }).catch(() => {
          // Keep the smart archetype fallback
        });
      } else {
        const smartFallback = buildSmartArchetypeFallback(item, itemMat, partMats);
        smartFallback.userData = { isColliding };
        itemGroup.add(smartFallback);
      }

      if (item.category === 'Lighting' && !isColliding) {
        const lightColorHex = item.lightColor || '#fef08a';
        const lightIntensityVal = item.lightIntensity !== undefined ? item.lightIntensity : 1.2;
        const spot = new THREE.PointLight(new THREE.Color(lightColorHex), lightIntensityVal, 8);
        // Ceiling lights shine downwards from the bottom of the fixture
        spot.position.y = isCeiling ? Math.max(0.08, (item.height * CM) * 0.25) : item.height * CM + 0.15;
        spot.castShadow = true;
        itemGroup.add(spot);
      }

      group.add(itemGroup);
    });
  }, [plan, collidingItemIds, activeFloor, floor3DMode]);

  // Update Selection & Hover highlights smoothly in 3D without tearing down the scene graph
  useEffect(() => {
    const group = meshesGroupRef.current;
    if (!group) return;

    group.traverse((child) => {
      let current: THREE.Object3D | null = child;
      let targetId: string | null = null;
      let targetType: string | null = null;

      while (current && current !== group) {
        if (current.userData && current.userData.id) {
          targetId = current.userData.id;
          targetType = current.userData.type;
          break;
        }
        current = current.parent;
      }

      if (targetId && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).emissive) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const isSelected = selectedId === targetId;
          const isHovered = hoveredId === targetId;
          const isColliding = current?.userData?.isColliding;

          if (isColliding) {
            mat.emissive.setHex(0xff0000);
            mat.emissiveIntensity = 0.8;
          } else if (isSelected) {
            mat.emissive.setHex(0x4f46e5); // Indigo selection highlight
            mat.emissiveIntensity = 0.45;
          } else if (isHovered) {
            mat.emissive.setHex(0x38bdf8); // Sky blue hover highlight
            mat.emissiveIntensity = 0.35;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [selectedId, hoveredId]);


  // Capture Photo Snapshot based on selected floor
  const handleTakePhotoSnapshot = () => {
    setIsRenderStudioOpen(true);
  };

  const handleCaptureRenderStudioSnapshot = async (settings: RenderSnapshotSettings): Promise<string | null> => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return null;

    // Determine target dimensions based on aspect ratio & resolution multiplier
    let baseWidth = 1920;
    let baseHeight = 1080;
    if (settings.aspectRatio === '4:3') {
      baseWidth = 1600;
      baseHeight = 1200;
    } else if (settings.aspectRatio === '1:1') {
      baseWidth = 1440;
      baseHeight = 1440;
    } else if (settings.aspectRatio === '9:16') {
      baseWidth = 1080;
      baseHeight = 1920;
    }

    const targetWidth = baseWidth * (settings.resolutionMultiplier === 4 ? 2 : settings.resolutionMultiplier === 2 ? 1.25 : 0.8);
    const targetHeight = baseHeight * (settings.resolutionMultiplier === 4 ? 2 : settings.resolutionMultiplier === 2 ? 1.25 : 0.8);

    // Save current renderer state
    const originalSize = new THREE.Vector2();
    renderer.getSize(originalSize);
    const originalAspect = camera.aspect;

    // Render offscreen at target high-resolution & exact aspect ratio
    camera.aspect = targetWidth / targetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(targetWidth, targetHeight, false);
    renderer.render(scene, camera);

    // Create compositing canvas to add branding watermark if enabled
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');

    if (ctx) {
      // Draw 3D scene render
      ctx.drawImage(renderer.domElement, 0, 0);

      // Add architectural watermark & project metadata if enabled
      if (settings.includeWatermark) {
        ctx.save();
        // Subtle dark gradient bar at bottom
        const grad = ctx.createLinearGradient(0, targetHeight - 80, 0, targetHeight);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, targetHeight - 80, targetWidth, 80);

        // Watermark text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(settings.watermarkText || 'Visual Rendered 3D Studio', 32, targetHeight - 28);

        // Right side metadata
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        const floorText = activeFloor === 0 ? 'Ground Floor' : activeFloor === 1 ? '1st Floor' : `Floor ${activeFloor}`;
        ctx.fillText(`${plan.name || 'Architecture'} • ${floorText}`, targetWidth - 32, targetHeight - 28);
        ctx.restore();
      }
    }

    const dataUrl = finalCanvas.toDataURL('image/png');

    // Restore original canvas view
    camera.aspect = originalAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(originalSize.x, originalSize.y, false);
    renderer.render(scene, camera);

    return dataUrl;
  };

  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // 3D Pick-and-Drag / Orbit / Pan / Visitor Look
  // Accurate helper to find the front-most interactive 3D furniture or wall mesh under pointer
  const findItemAtPointer = (
    clientX: number,
    clientY: number
  ): { id: string | null; type: 'furniture' | 'wall' | 'floorSign' | 'floorPad' | 'roomFloor' | null; floorLevel?: number } => {
    if (!cameraRef.current || !meshesGroupRef.current || !canvasMountRef.current) {
      return { id: null, type: null, floorLevel: undefined };
    }
    const rect = canvasMountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);

    for (const hit of intersects) {
      if (!hit.object.visible) continue;

      let current: THREE.Object3D | null = hit.object;
      while (current && current !== meshesGroupRef.current) {
        if (current.userData && current.userData.id) {
          const type = current.userData.type;
          const floorLvl = current.userData.floorLevel;
          if (type === 'furniture' || type === 'wall' || type === 'floorSign' || type === 'floorPad' || type === 'roomFloor') {
            return { id: current.userData.id, type, floorLevel: floorLvl };
          }
        }
        current = current.parent;
      }
    }

    return { id: null, type: null, floorLevel: undefined };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    hasMovedPastThresholdRef.current = false;
    canDragSelectedItemRef.current = false;
    pendingClickedItemRef.current = null;

    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    // Free Hand / Pan Tool or Middle/Right click: Strictly Pan camera view, NEVER select or drag furniture
    if (isFreeHand || e.button === 1 || e.button === 2) {
      isPanningRef.current = true;
      setIsPanningState(true);
      return;
    }

    // Check if user pressed on 3D furniture or wall item
    if (
      cameraModeRef.current === 'aerial' &&
      toolModeRef.current === 'select' &&
      !isSpacePressedRef.current &&
      e.button === 0
    ) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      if (hit.id && hit.type) {
        pendingClickedItemRef.current = { id: hit.id, type: hit.type };

        // If user pressed on the ALREADY selected furniture item, prepare for possible 3D translation drag
        if (hit.type === 'furniture' && selectedIdRef.current === hit.id) {
          const item = planRef.current.furniture.find((f) => f.id === hit.id);
          if (item && !item.isLocked) {
            canDragSelectedItemRef.current = true;
            draggedItemIdRef.current = item.id;

            const offset = getFloor3DOffset(item.floorLevel || 0);
            const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
            const hitPoint = new THREE.Vector3();
            const rect = canvasMountRef.current!.getBoundingClientRect();
            const mouse = new THREE.Vector2(
              ((e.clientX - rect.left) / rect.width) * 2 - 1,
              -((e.clientY - rect.top) / rect.height) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current!);
            if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
              dragOffsetRef.current = {
                x: hitPoint.x - (item.x * 0.01 + offset.x),
                z: hitPoint.z - (item.y * 0.01 + offset.z),
              };
            }
          }
        }
      }
    }

    // Default: Smooth Camera Orbit / Pan on drag
    if (e.button === 0) {
      isDraggingRef.current = true;
    } else if (e.button === 2 || e.button === 1) {
      isPanningRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    const moveDist = Math.hypot(
      e.clientX - mouseDownPosRef.current.x,
      e.clientY - mouseDownPosRef.current.y
    );
    if (moveDist > 4) {
      hasMovedPastThresholdRef.current = true;
    }

    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    // 1. ACTIVE 3D FURNITURE DRAGGING & PLACEMENT (Only when dragging an already selected item past threshold)
    if (
      !isFreeHand &&
      hasMovedPastThresholdRef.current &&
      canDragSelectedItemRef.current &&
      draggedItemIdRef.current &&
      cameraRef.current &&
      canvasMountRef.current &&
      onUpdatePlanRef.current
    ) {
      isDraggingRef.current = false; // Cancel camera orbit
      if (!isDraggingObjectRef.current) {
        isDraggingObjectRef.current = true;
        setIsDraggingObjectState(true);
      }

      const rect = canvasMountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const currentItem = planRef.current.furniture.find(
        (f) => f.id === draggedItemIdRef.current
      );

      const offset = getFloor3DOffset(currentItem?.floorLevel || 0);
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
      const hitPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
        const targetWorldX = hitPoint.x - dragOffsetRef.current.x - offset.x;
        const targetWorldZ = hitPoint.z - dragOffsetRef.current.z - offset.z;

        // Convert world meters to plan cm with 5cm magnetic grid snapping
        const rawPlanX = targetWorldX * 100;
        const rawPlanY = targetWorldZ * 100;
        const snappedX = Math.round(rawPlanX / 5) * 5;
        const snappedY = Math.round(rawPlanY / 5) * 5;

        if (currentItem && (currentItem.x !== snappedX || currentItem.y !== snappedY)) {
          let updatedItem: FurnitureItem = { ...currentItem, x: snappedX, y: snappedY };

          // If tabletop item, auto-attach to any supporting table beneath it
          if (isTabletopItem(updatedItem)) {
            const attachResult = autoAttachToTabletop(updatedItem, planRef.current.furniture);
            updatedItem = {
              ...updatedItem,
              elevation: attachResult.targetElevation,
              hostFurnitureId: attachResult.host ? attachResult.host.id : undefined,
            };
          }

          onUpdatePlanRef.current({
            ...planRef.current,
            furniture: planRef.current.furniture.map((f) =>
              f.id === draggedItemIdRef.current ? updatedItem : f
            ),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      return;
    }

    // 2. HOVER DETECTION & HIGHLIGHT (Instant 60fps, non-blocking)
    if (
      cameraModeRef.current === 'aerial' &&
      !isDraggingRef.current &&
      !isPanningRef.current &&
      !isDraggingObjectRef.current
    ) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      const nextHoverId = hit.id;
      if (nextHoverId !== hoveredIdRef.current) {
        setHoveredId(nextHoverId);
        setIsHoveringObject(!!nextHoverId);
      }
    } else if (hoveredIdRef.current !== null && (isDraggingRef.current || isPanningRef.current)) {
      setHoveredId(null);
      setIsHoveringObject(false);
    }

    // 3. CAMERA ORBIT / PAN / VISITOR HEAD LOOK
    if (cameraMode === 'visitor') {
      if (isDraggingRef.current) {
        visitorYawRef.current -= dx * 0.005;
        visitorPitchRef.current = Math.max(
          -Math.PI / 2.5,
          Math.min(Math.PI / 2.5, visitorPitchRef.current - dy * 0.005)
        );
      } else if (isPanningRef.current) {
        // Free Hand Strafe/Pan in Visitor Walk Mode
        const panSpeed = 0.008;
        const forward = new THREE.Vector3(
          Math.sin(visitorYawRef.current),
          0,
          -Math.cos(visitorYawRef.current)
        );
        const right = new THREE.Vector3(
          Math.cos(visitorYawRef.current),
          0,
          Math.sin(visitorYawRef.current)
        );
        visitorPosRef.current.addScaledVector(right, -dx * panSpeed);
        visitorPosRef.current.addScaledVector(forward, dy * panSpeed);
      }
    } else {
      if (isDraggingRef.current) {
        const s = sphericalRef.current;
        s.theta -= dx * 0.008;
        s.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, s.phi - dy * 0.008));
      } else if (isPanningRef.current) {
        const panSpeed = 0.015;
        const forward = new THREE.Vector3(
          -Math.sin(sphericalRef.current.theta),
          0,
          -Math.cos(sphericalRef.current.theta)
        );
        const right = new THREE.Vector3(
          Math.cos(sphericalRef.current.theta),
          0,
          -Math.sin(sphericalRef.current.theta)
        );
        targetRef.current.addScaledVector(right, -dx * panSpeed);
        targetRef.current.addScaledVector(forward, dy * panSpeed);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const wasDraggingObject = isDraggingObjectRef.current;
    const wasPanning = isPanningRef.current;
    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    isDraggingObjectRef.current = false;
    setIsDraggingObjectState(false);
    canDragSelectedItemRef.current = false;
    draggedItemIdRef.current = null;
    isDraggingRef.current = false;
    isPanningRef.current = false;
    setIsPanningState(false);

    // If we were using the Free Hand tool, panning, or finishing a 3D drag, do not alter selection
    if (wasDraggingObject || isFreeHand || wasPanning) {
      return;
    }

    // Clean Click Selection & Synchronized Floor Focus in 3D
    if (cameraModeRef.current === 'aerial' && !hasMovedPastThresholdRef.current) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      if (hit.floorLevel !== undefined && onFloorChange && hit.floorLevel !== activeFloorRef.current) {
        onFloorChange(hit.floorLevel);
      }

      if (hit.id && (hit.type === 'furniture' || hit.type === 'wall')) {
        onSelectId(hit.id);
      } else {
        onSelectId(null); // Clicked on floor pad/sign/sky -> clear item selection cleanly
      }
    }
  };

  // HTML5 Drag and Drop Handlers for dragging Catalog Items onto the 3D Viewport
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCatalog) {
      setIsDragOverCatalog(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverCatalog(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCatalog(false);

    let itemData: CatalogItem | null = null;
    try {
      const json = e.dataTransfer.getData('application/json');
      if (json) {
        itemData = JSON.parse(json);
      }
    } catch (err) {
      console.warn('Failed to parse dropped catalog item in 3D view', err);
    }

    if (!itemData) return;
    if (!cameraRef.current || !canvasMountRef.current || !onUpdatePlanRef.current) return;

    const rect = canvasMountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const allFloors = planRef.current.floors && planRef.current.floors.length > 0 ? planRef.current.floors : [
      { level: 0, name: 'Ground Floor' },
      { level: 1, name: '1st Floor' },
    ];
    const getFloor3DOffset = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return { x: 0, y: 0, z: 0 };
      } else if (floor3DMode === 'sideBySide') {
        const floorIdx = allFloors.findIndex((fl) => fl.level === level);
        const validIdx = floorIdx >= 0 ? floorIdx : 0;
        const mid = (allFloors.length - 1) / 2;
        return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
      } else {
        return { x: 0, y: level * 2.5, z: 0 };
      }
    };

    const offset = getFloor3DOffset(activeFloor || 0);
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
    const hitPoint = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
      const targetWorldX = hitPoint.x - offset.x;
      const targetWorldZ = hitPoint.z - offset.z;
      const snappedX = Math.round((targetWorldX * 100) / 5) * 5;
      const snappedY = Math.round((targetWorldZ * 100) / 5) * 5;

      const currentPlan = planRef.current;
      const isDroppedCeiling =
        itemData.placementType === 'ceiling' ||
        (itemData.category || '').toLowerCase().includes('ceiling') ||
        (itemData.name || '').toLowerCase().includes('pendant') ||
        (itemData.name || '').toLowerCase().includes('chandelier') ||
        (itemData.name || '').toLowerCase().includes('ceiling fan') ||
        (itemData.name || '').toLowerCase().includes('downlight') ||
        (itemData.name || '').toLowerCase().includes('flush');

      const droppedElevation = isDroppedCeiling ? Math.max(120, 250 - (itemData.height || 50)) : 0;

      let newItem: FurnitureItem = {
        id: `f_${Date.now()}`,
        catalogId: itemData.id,
        name: itemData.name,
        category: itemData.category,
        x: snappedX,
        y: snappedY,
        elevation: droppedElevation,
        width: itemData.width,
        depth: itemData.depth,
        height: itemData.height,
        angle: 0,
        color: itemData.defaultColor,
        model: itemData.model,
        roughness: itemData.roughness,
        metalness: itemData.metalness,
        opacity: itemData.opacity,
        floorLevel: activeFloor,
        isVisible: true,
        isLocked: false,
        placementType: itemData.placementType || 'floor',
        placeOnTable:
          itemData.placeOnTable ||
          itemData.placementType === 'tabletop',
        allowedOnFloor:
          itemData.allowedOnFloor !== undefined
            ? itemData.allowedOnFloor
            : itemData.placementType !== 'tabletop',
      };

      if (isTabletopItem(newItem)) {
        const attachResult = autoAttachToTabletop(newItem, currentPlan.furniture);
        newItem = {
          ...newItem,
          elevation: attachResult.targetElevation,
          hostFurnitureId: attachResult.host ? attachResult.host.id : undefined,
        };
      }

      onUpdatePlanRef.current({
        ...currentPlan,
        furniture: [...currentPlan.furniture, newItem],
        updatedAt: new Date().toISOString(),
      });
      onSelectId(newItem.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (cameraMode === 'visitor') {
      const forward = new THREE.Vector3(
        Math.sin(visitorYawRef.current),
        0,
        -Math.cos(visitorYawRef.current)
      );
      visitorPosRef.current.addScaledVector(forward, e.deltaY < 0 ? 0.5 : -0.5);
    } else {
      // 3D ORBIT VIEW: ZOOM TOWARDS MOUSE CURSOR POSITION
      if (cameraRef.current && canvasMountRef.current) {
        const rect = canvasMountRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Find intersection with the floor plane or 3D object under mouse
        const curOffset = getFloor3DOffset(activeFloor || 0);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -curOffset.y);
        const hitPoint = new THREE.Vector3();
        let targetFocusPoint: THREE.Vector3 | null = null;

        if (meshesGroupRef.current) {
          const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);
          if (intersects.length > 0) {
            targetFocusPoint = intersects[0].point;
          }
        }
        if (!targetFocusPoint && raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
          targetFocusPoint = hitPoint;
        }

        const zoomDelta = e.deltaY < 0 ? -1 : 1;
        const zoomFactor = zoomDelta < 0 ? 0.85 : 1.18;
        const oldRadius = sphericalRef.current.radius;
        const newRadius = Math.max(0.3, Math.min(120, oldRadius * zoomFactor));
        sphericalRef.current.radius = newRadius;

        // When zooming in towards cursor, gently shift orbit pivot towards cursor position
        if (targetFocusPoint && zoomDelta < 0) {
          const shiftFactor = 0.14;
          targetRef.current.x += (targetFocusPoint.x - targetRef.current.x) * shiftFactor;
          targetRef.current.y += (targetFocusPoint.y - targetRef.current.y) * shiftFactor;
          targetRef.current.z += (targetFocusPoint.z - targetRef.current.z) * shiftFactor;
        }
      }
    }
  };

  // Switch to Virtual Visitor mode and place in center of primary room on the currently selected floor
  const handleSwitchToVisitor = () => {
    setCameraMode('visitor');
    onSelectId(null);

    const currentTargetFloor = activeFloorRef.current !== undefined ? activeFloorRef.current : (activeFloor || 0);
    const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === currentTargetFloor) || plan.rooms[0];
    let initX = 0;
    let initZ = 0;
    if (targetRoom && targetRoom.points.length > 0) {
      initX = (targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length) * 0.01;
      initZ = (targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length) * 0.01;
    }
    visitorPosRef.current.set(initX, 1.6, initZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
    lastSentPosRef.current = { x: Math.round(initX * 100), y: Math.round(initZ * 100), yaw: 0 };

    if (onVisitorCameraChange) {
      onVisitorCameraChange({
        x: Math.round(initX * 100),
        y: Math.round(initZ * 100),
        yaw: 0,
        elevation: 160,
        floorLevel: currentTargetFloor,
      });
    }
  };

  // Teleport visitor to a specific room
  // React to parent targetRoomToFocus
  useEffect(() => {
    if (targetRoomToFocus) {
      handleTeleportToRoom(targetRoomToFocus);
    }
  }, [targetRoomToFocus]);

  const handleTeleportToRoom = (room: Room) => {
    setCameraMode('visitor');
    onSelectId(null);
    if (room.floorLevel !== undefined && onFloorChange && room.floorLevel !== activeFloor) {
      onFloorChange(room.floorLevel);
    }
    let avgX = 0;
    let avgZ = 0;
    if (room && room.points && room.points.length > 0) {
      avgX = (room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length) * 0.01;
      avgZ = (room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length) * 0.01;
    }
    visitorPosRef.current.set(avgX, 1.6, avgZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
    lastSentPosRef.current = { x: Math.round(avgX * 100), y: Math.round(avgZ * 100), yaw: 0 };

    if (onVisitorCameraChange) {
      onVisitorCameraChange({
        x: Math.round(avgX * 100),
        y: Math.round(avgZ * 100),
        yaw: 0,
        elevation: 160,
        floorLevel: room.floorLevel ?? activeFloor,
      });
    }
  };

  // Virtual D-pad Movement actions for mouse/touch
  const walkStep = (dir: 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight') => {
    const stepDist = 0.6; // 60cm step
    const forward = new THREE.Vector3(
      Math.sin(visitorYawRef.current),
      0,
      -Math.cos(visitorYawRef.current)
    );
    const right = new THREE.Vector3(
      Math.cos(visitorYawRef.current),
      0,
      Math.sin(visitorYawRef.current)
    );

    if (dir === 'forward') visitorPosRef.current.addScaledVector(forward, stepDist);
    if (dir === 'backward') visitorPosRef.current.addScaledVector(forward, -stepDist);
    if (dir === 'left') visitorPosRef.current.addScaledVector(right, -stepDist);
    if (dir === 'right') visitorPosRef.current.addScaledVector(right, stepDist);
    if (dir === 'turnLeft') visitorYawRef.current += Math.PI / 8;
    if (dir === 'turnRight') visitorYawRef.current -= Math.PI / 8;
  };

  const handleResetCamera = () => {
    if (cameraMode === 'visitor') {
      handleSwitchToVisitor();
    } else {
      sphericalRef.current = { radius: 14, theta: Math.PI / 4, phi: Math.PI / 3.2 };
      targetRef.current.set(0, 1.0, 0);
    }
  };

  // 3D Quick Actions for Selected Furniture Item
  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);

  const handle3DRotate = (deltaAngle: number) => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (!item) return;
    const newAngle = ((item.angle || 0) + deltaAngle + Math.PI * 2) % (Math.PI * 2);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === selectedId ? { ...f, angle: newAngle } : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DNudge = (dx: number, dy: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId ? { ...f, x: f.x + dx, y: f.y + dy } : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DElevation = (delta: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? { ...f, elevation: Math.max(0, (f.elevation || 0) + delta) }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DScale = (multiplier: number) => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (!item) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? {
              ...f,
              width: Math.max(10, Math.round(f.width * multiplier)),
              depth: Math.max(10, Math.round(f.depth * multiplier)),
              height: Math.max(10, Math.round(f.height * multiplier)),
            }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DResize = (dim: 'width' | 'depth' | 'height', delta: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? {
              ...f,
              [dim]: Math.max(10, Math.round(f[dim] + delta)),
            }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DDelete = () => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (item?.isLocked) {
      alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
      return;
    }
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== selectedId),
      updatedAt: new Date().toISOString(),
    });
    onSelectId(null);
  };

  const handle3DDuplicate = () => {
    if (!selectedFurniture || !onUpdatePlan) return;
    const copy: FurnitureItem = {
      ...selectedFurniture,
      id: `f_${Date.now()}`,
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

  const isFreeHandActive = toolMode === 'pan' || isSpacePressed;

  return (
    <div
      className={`relative w-full h-full bg-slate-100 overflow-hidden select-none ${
        isFreeHandActive
          ? isPanningState
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : isDraggingObjectState
          ? 'cursor-grabbing'
          : isHoveringObject
          ? 'cursor-grab'
          : 'cursor-default'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Visual Guide Overlay when Dragging Catalog Item over 3D Viewport */}
      {isDragOverCatalog && (
        <div className="absolute inset-0 bg-sky-500/10 border-2 border-dashed border-sky-400 pointer-events-none z-30 flex items-center justify-center animate-in fade-in duration-150 backdrop-blur-2xs">
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-sky-300 text-sky-700 font-bold text-sm flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-sky-500 animate-bounce" />
            <span>Drop item here to place in 3D scene (Floor {activeFloor})</span>
          </div>
        </div>
      )}

      {/* Three.js Canvas Mount - Isolated */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top 3D Viewport Controls (Hidden in Customer Presentation Tour) */}
      {!isCustomerMode && (
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        {/* 3D Tool Mode: Select vs Free Hand Pan */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setToolMode('select')}
            className={`px-2 py-1 rounded-md text-[11px] transition flex items-center gap-1 ${
              toolMode === 'select'
                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Select & Move 3D Items (V)"
          >
            <MousePointer className="w-3 h-3" />
            <span>Select</span>
          </button>
          <button
            onClick={() => setToolMode('pan')}
            className={`px-2 py-1 rounded-md text-[11px] transition flex items-center gap-1 ${
              toolMode === 'pan'
                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Free Hand / Pan View Tool (H or Hold Space) - Move 3D scene without selecting items"
          >
            <Hand className="w-3 h-3" />
            <span>Hand</span>
          </button>
        </div>

        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

        {/* Camera Mode */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCameraMode('aerial')}
            className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
              cameraMode === 'aerial'
                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Aerial Orbit View"
          >
            <Rotate3d className="w-3 h-3" />
            <span>Orbit</span>
          </button>
          <button
            onClick={handleSwitchToVisitor}
            className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
              cameraMode === 'visitor'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Virtual Visitor Walking Mode (1.6m)"
          >
            <User className="w-3 h-3" />
            <span>Walk (1.6m)</span>
          </button>
        </div>

        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

        {/* Zoom In & Out */}
        <button
          onClick={() => {
            if (cameraMode === 'visitor') {
              const forward = new THREE.Vector3(
                Math.sin(visitorYawRef.current),
                0,
                -Math.cos(visitorYawRef.current)
              );
              visitorPosRef.current.addScaledVector(forward, 0.8);
            } else {
              sphericalRef.current.radius = Math.max(0.3, sphericalRef.current.radius * 0.75);
            }
          }}
          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
          title="Max Zoom In (30cm Close-Up)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            if (cameraMode === 'visitor') {
              const forward = new THREE.Vector3(
                Math.sin(visitorYawRef.current),
                0,
                -Math.cos(visitorYawRef.current)
              );
              visitorPosRef.current.addScaledVector(forward, -0.8);
            } else {
              sphericalRef.current.radius = Math.min(120, sphericalRef.current.radius * 1.25);
            }
          }}
          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

        {/* Snapshot Photo */}
        <button
          onClick={handleTakePhotoSnapshot}
          disabled={isCapturing}
          className="p-1.5 hover:bg-slate-100 text-sky-700 rounded-lg transition"
          title="Take Photo Render (PNG)"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        {/* Time of Day */}
        <div className="flex items-center gap-1 pl-1 pr-1" title={`Sun Time: ${Math.floor(timeOfDay)}:${timeOfDay % 1 !== 0 ? '30' : '00'}`}>
          <Sun className="w-3 h-3 text-amber-500" />
          <input
            type="range"
            min="6"
            max="22"
            step="0.5"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-12 accent-sky-600 h-1 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* Reset Camera */}
        <button
          onClick={handleResetCamera}
          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition"
          title="Reset Camera View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
      )}

      {/* Room Jump Pills in Visitor Mode (Constrained to activeFloor only) */}
      {!isCustomerMode && cameraMode === 'visitor' && plan.rooms.length > 0 && (
        <div className="absolute top-12 right-2.5 z-10 flex flex-wrap gap-1 max-w-xs justify-end">
          {plan.rooms
            .filter((r) => (r.floorLevel ?? 0) === activeFloor)
            .map((room) => (
              <button
                key={room.id}
                onClick={() => handleTeleportToRoom(room)}
                className="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-emerald-600 text-slate-700 hover:text-white text-[11px] font-medium border border-slate-200 shadow-sm backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{room.name}</span>
              </button>
            ))}
        </div>
      )}

      {/* Walk View Boundary Warning Alert */}
      {walkWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl border border-amber-400 text-xs animate-bounce">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{walkWarning}</span>
        </div>
      )}

      {/* Collision Alert Banner (Non-overlapping at Bottom Left) */}
      {collidingItemIds.size > 0 && (
        <div className="absolute bottom-12 left-3 z-10 flex items-center gap-1.5 bg-rose-600 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-rose-500 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{collidingItemIds.size} Colliding (Red)</span>
        </div>
      )}


      {/* Virtual Visitor On-Screen D-Pad / Walk Controller */}
      {cameraMode === 'visitor' && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-xl flex flex-col items-center gap-1.5 select-none">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Walk Controller
          </span>
          <button
            onClick={() => walkStep('forward')}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white flex items-center justify-center transition active:scale-90 border border-slate-200 shadow-2xs"
            title="Walk Forward (W or ↑)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => walkStep('turnLeft')}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white flex items-center justify-center transition active:scale-90 border border-slate-200 shadow-2xs"
              title="Turn Left (A or ←)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => walkStep('backward')}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white flex items-center justify-center transition active:scale-90 border border-slate-200 shadow-2xs"
              title="Walk Backward (S or ↓)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => walkStep('turnRight')}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white flex items-center justify-center transition active:scale-90 border border-slate-200 shadow-2xs"
              title="Turn Right (D or →)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => walkStep('left')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 border border-slate-200 font-semibold"
              title="Strafe Left (Q)"
            >
              ⤹ Strafe L
            </button>
            <button
              onClick={() => walkStep('right')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 border border-slate-200 font-semibold"
              title="Strafe Right (E)"
            >
              Strafe R ⤸
            </button>
          </div>
        </div>
      )}

      {/* Floating 3D Pick & Drag / Visitor Instructions Banner */}
      {!isCustomerMode && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-[11px] text-slate-600 pointer-events-none shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>
            {toolMode === 'pan' || isSpacePressed
              ? '🖐️ Free Hand Tool Active: Click and drag anywhere to pan the 3D scene smoothly (Press V or Click Select to exit)'
              : cameraMode === 'visitor'
              ? 'Virtual Visitor: Use W/A/S/D or D-Pad to walk • Drag to look 360° • Click & drag furniture to reposition • Press H for Free Hand'
              : '3D Drag & Drop: Click and drag any furniture piece on the floor • Press R to rotate • Press H or Hold Space for Free Hand Pan'}
          </span>
        </div>
      )}

      {/* Cinematic 4K Render Studio Modal */}
      <RenderStudioModal
        isOpen={isRenderStudioOpen}
        onClose={() => setIsRenderStudioOpen(false)}
        onCaptureSnapshot={handleCaptureRenderStudioSnapshot}
        projectName={plan.name}
        activeFloor={activeFloor}
      />
    </div>
  );
};
