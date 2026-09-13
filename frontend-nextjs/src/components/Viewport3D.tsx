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
  Palette
} from 'lucide-react';
import { HomePlan, FurnitureItem, Wall, Room, CatalogItem } from '../types/plan';
import { isTabletopItem, autoAttachToTabletop } from '../services/tabletopAttachment';
import { loadObjGeometry } from '../services/objParser';
import {
  buildTableMeshGroup,
  buildChairMeshGroup,
  buildSofaMeshGroup,
  buildCabinetMeshGroup,
  buildBedMeshGroup,
  buildLampMeshGroup,
  buildCustomPrimitivesMeshGroup,
} from '../services/proceduralFurniture';

interface Viewport3DProps {
  plan: HomePlan;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdatePlan?: (plan: HomePlan) => void;
  isCustomerMode?: boolean;
  collidingItemIds?: Set<string>;
  activeFloor?: number;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  plan,
  selectedId,
  onSelectId,
  onUpdatePlan,
  isCustomerMode = false,
  collidingItemIds = new Set(),
  activeFloor = 0,
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
  const [isDraggingObjectState, setIsDraggingObjectState] = useState(false);
  const [isDragOverCatalog, setIsDragOverCatalog] = useState(false);

  // 3D Floor Isolation & Multi-Floor Mode: 'isolated' (Focus Active Floor) | 'stacked' (All Floors) | 'sideBySide' (All Floors Side-by-Side)
  const [floor3DMode, setFloor3DMode] = useState<'isolated' | 'stacked' | 'sideBySide'>('sideBySide');

  // Camera Mode: 'aerial' (orbit) or 'visitor' (human eye level walkthrough at 160cm)
  const [cameraMode, setCameraMode] = useState<'aerial' | 'visitor'>('aerial');
  const cameraModeRef = useRef<'aerial' | 'visitor'>('aerial');
  cameraModeRef.current = cameraMode;

  const [timeOfDay, setTimeOfDay] = useState<number>(plan.environment?.timeOfDay || 14.5);
  const [isCapturing, setIsCapturing] = useState(false);

  // Aerial Orbit State
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetRef = useRef(new THREE.Vector3(0, 1.0, 0));

  // Virtual Visitor State (Human eye level 1.6m above active floor)
  const visitorPosRef = useRef(new THREE.Vector3(0, 1.6, 0));
  const visitorYawRef = useRef(0);
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

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
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

        // Apply Visitor Camera Position & Look Direction
        const vp = visitorPosRef.current;
        const floorHeight = (activeFloor || 0) * 2.5;
        camera.position.set(vp.x, floorHeight + 1.6, vp.z);

        const lookDir = new THREE.Vector3(
          Math.sin(visitorYawRef.current) * Math.cos(visitorPitchRef.current),
          Math.sin(visitorPitchRef.current),
          -Math.cos(visitorYawRef.current) * Math.cos(visitorPitchRef.current)
        );
        camera.lookAt(camera.position.clone().add(lookDir));
      } else {
        // Apply Aerial Orbit Camera Position
        const s = sphericalRef.current;
        const x = targetRef.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        const y = targetRef.current.y + s.radius * Math.cos(s.phi);
        const z = targetRef.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
        camera.position.set(x, y, z);
        camera.lookAt(targetRef.current);
      }

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
  }, [activeFloor]);

  // Update Sunlight based on Time of Day
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;

    const sunAngle = ((timeOfDay - 6) / 18) * Math.PI;
    const isDay = timeOfDay >= 5.5 && timeOfDay <= 19.5;

    if (isDay) {
      const sunY = Math.max(0.1, Math.sin(sunAngle) * 30);
      const sunX = Math.cos(sunAngle) * 30;
      dirLightRef.current.position.set(sunX, sunY, 15);

      if (timeOfDay < 8 || timeOfDay > 17) {
        dirLightRef.current.color.setHex(0xffaa5e);
        dirLightRef.current.intensity = 1.2;
      } else {
        dirLightRef.current.color.setHex(0xfff5e6);
        dirLightRef.current.intensity = 1.6;
      }
      hemiLightRef.current.intensity = 0.75;
      sceneRef.current.background = new THREE.Color(0x0f172a);
    } else {
      dirLightRef.current.position.set(10, 20, -10);
      dirLightRef.current.color.setHex(0x38bdf8);
      dirLightRef.current.intensity = 0.3;
      hemiLightRef.current.intensity = 0.2;
      sceneRef.current.background = new THREE.Color(0x020617);
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
      group.add(padMesh);

      // High-Definition 3D Floor Placard Signboard
      const roomNames = floorRooms.map((r) => r.name);
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 1024;
      labelCanvas.height = 256;
      const lctx = labelCanvas.getContext('2d');
      if (lctx) {
        const grad = lctx.createLinearGradient(0, 0, 1024, 256);
        if (fl.level === 0) {
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(1, '#0369a1');
        } else {
          grad.addColorStop(0, '#059669');
          grad.addColorStop(1, '#047857');
        }
        lctx.fillStyle = grad;
        lctx.beginPath();
        lctx.roundRect(16, 16, 992, 224, 28);
        lctx.fill();

        lctx.strokeStyle = '#ffffff';
        lctx.lineWidth = 6;
        lctx.stroke();

        // Floor Name Title
        lctx.fillStyle = '#ffffff';
        lctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        const floorTitle = fl.level === 0 ? `🏢 ${fl.name.toUpperCase()}` : `🏡 ${fl.name.toUpperCase()}`;
        lctx.fillText(floorTitle, 512, 78);

        // Subtitle (Room names & Elevation)
        lctx.fillStyle = '#f0fdf4';
        lctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
        const subText =
          roomNames.length > 0
            ? roomNames.join('   •   ')
            : `Floor Level ${fl.level} (Elevation: ${fl.elevation || fl.level * 250}cm)`;
        lctx.fillText(subText, 512, 165);

        const labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.minFilter = THREE.LinearFilter;
        const placardW = Math.min(6.5, padW * 0.75);
        const placardH = placardW * (256 / 1024);
        const labelGeom = new THREE.PlaneGeometry(placardW, placardH);
        const labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(centerX, offset.y + 0.35, maxZ + offset.z + 1.2);
        labelMesh.rotation.x = -Math.PI / 4; // Angled 45 deg upward toward camera
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
      const mat = new THREE.MeshStandardMaterial({
        color: room.floorColor ? new THREE.Color(room.floorColor) : 0xd8b48f,
        roughness: 0.6,
        metalness: 0.05,
      });

      const floorMesh = new THREE.Mesh(geom, mat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(offset.x, offset.y + 0.005, offset.z);
      floorMesh.receiveShadow = true;
      group.add(floorMesh);
    });

    // 2. Build Walls
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

      const geom = new THREE.BoxGeometry(length, height, thickness);
      const isSelected = selectedId === wall.id;

      const mat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : wall.color ? new THREE.Color(wall.color) : 0xf8fafc,
        roughness: 0.85,
        metalness: 0.02,
      });

      const wallMesh = new THREE.Mesh(geom, mat);
      wallMesh.position.set(
        (x1 + x2) / 2 + offset.x,
        offset.y + height / 2,
        (z1 + z2) / 2 + offset.z
      );
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.userData = { id: wall.id, type: 'wall' };

      group.add(wallMesh);
    });

    // 3. Build Furniture Items (with VIBRANT RED GLOW on Collision)
    plan.furniture.filter((f) => isFloorVisible(f.floorLevel ?? 0)).forEach((item) => {
      if (item.isVisible === false) return;

      const isSelected = selectedId === item.id;
      const isColliding = collidingItemIds.has(item.id);
      const offset = getFloor3DOffset(item.floorLevel ?? 0);

      const itemGroup = new THREE.Group();
      itemGroup.position.set(
        item.x * CM + offset.x,
        offset.y + (item.elevation || 0) * CM,
        item.y * CM + offset.z
      );
      itemGroup.rotation.y = -(item.angle || 0);
      itemGroup.userData = { id: item.id, type: 'furniture', isColliding };

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
          emissive: new THREE.Color(0x0284c7),
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

      if (item.model && item.model.startsWith('procedural:')) {
        try {
          const parts = item.model.split(':');
          const pType = parts[1];
          const rawParams = parts.slice(2).join(':');
          const parsed = rawParams ? JSON.parse(rawParams) : {};

          let procGroup: THREE.Group | null = null;
          if (pType === 'table') {
            procGroup = buildTableMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'chair') {
            procGroup = buildChairMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'sofa') {
            procGroup = buildSofaMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'cabinet') {
            procGroup = buildCabinetMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'bed') {
            procGroup = buildBedMeshGroup({ ...parsed, width: item.width, depth: item.depth, height: item.height }, itemMat);
          } else if (pType === 'lamp') {
            procGroup = buildLampMeshGroup({ ...parsed, shadeWidth: item.width, shadeHeight: item.depth, totalHeight: item.height }, itemMat);
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
      } else if (item.model && (item.model.endsWith('.obj') || item.model.startsWith('local_obj:') || item.model.startsWith('data:'))) {
        loadObjGeometry(item.model).then((geom) => {
          geom.computeBoundingBox();
          const bbox = geom.boundingBox!;
          const size = new THREE.Vector3();
          bbox.getSize(size);

          const targetW = item.width * CM;
          const targetD = item.depth * CM;
          const targetH = item.height * CM;

          const scaleX = size.x > 0 ? targetW / size.x : targetW;
          const scaleY = size.y > 0 ? targetH / size.y : targetH;
          const scaleZ = size.z > 0 ? targetD / size.z : targetD;

          const mesh = new THREE.Mesh(geom, itemMat);
          mesh.scale.set(scaleX, scaleY, scaleZ);
          mesh.position.y = targetH / 2;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData = { isColliding };
          itemGroup.add(mesh);
        });
      } else {
        const geom = new THREE.BoxGeometry(item.width * CM, item.height * CM, item.depth * CM);
        const mesh = new THREE.Mesh(geom, itemMat);
        mesh.position.y = (item.height * CM) / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { isColliding };
        itemGroup.add(mesh);
      }

      if (item.category === 'Lighting' && !isColliding) {
        const lightColorHex = item.lightColor || '#fef08a';
        const lightIntensityVal = item.lightIntensity !== undefined ? item.lightIntensity : 1.2;
        const spot = new THREE.PointLight(new THREE.Color(lightColorHex), lightIntensityVal, 8);
        spot.position.y = item.height * CM + 0.2;
        spot.castShadow = true;
        itemGroup.add(spot);
      }

      group.add(itemGroup);
    });
  }, [plan, selectedId, collidingItemIds, activeFloor, floor3DMode]);


  // Capture Photo Snapshot (from Section 10 & 12 of guide)
  const handleTakePhotoSnapshot = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    setIsCapturing(true);
    setTimeout(() => {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${plan.name.replace(/\s+/g, '_')}_Photo_Render_3D.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setIsCapturing(false);
    }, 100);
  };

  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // 3D Pick-and-Drag / Orbit / Pan / Visitor Look
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    // Check if user clicked a 3D furniture item in Aerial or Visitor mode with Left Mouse Button (0)
    if (e.button === 0 && cameraRef.current && meshesGroupRef.current && canvasMountRef.current) {
      const rect = canvasMountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);

      let foundFurnitureId: string | null = null;
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && current !== meshesGroupRef.current) {
          if (current.userData && current.userData.type === 'furniture' && current.userData.id) {
            foundFurnitureId = current.userData.id;
            break;
          }
          current = current.parent;
        }
      }

      if (foundFurnitureId) {
        // User clicked directly on a 3D furniture piece
        const item = planRef.current.furniture.find((f) => f.id === foundFurnitureId);
        onSelectId(foundFurnitureId);

        // If locked, select but do not drag
        if (item?.isLocked) {
          return;
        }

        // Start 3D Dragging
        draggedItemIdRef.current = foundFurnitureId;
        isDraggingObjectRef.current = true;
        setIsDraggingObjectState(true);

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

        const offset = getFloor3DOffset(item?.floorLevel || 0);
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
        const hitPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
          if (item) {
            dragOffsetRef.current = {
              x: hitPoint.x - (item.x * 0.01 + offset.x),
              z: hitPoint.z - (item.y * 0.01 + offset.z),
            };
          }
        }
        return; // Don't initiate camera orbit
      }
    }

    // Default: Camera Orbit / Pan
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

    // 1. ACTIVE 3D FURNITURE DRAGGING & PLACEMENT
    if (
      isDraggingObjectRef.current &&
      draggedItemIdRef.current &&
      cameraRef.current &&
      canvasMountRef.current &&
      onUpdatePlanRef.current
    ) {
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

        const currentItem = planRef.current.furniture.find(
          (f) => f.id === draggedItemIdRef.current
        );
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

    // 2. HOVER DETECTION (Check if hovering over interactive furniture)
    if (!isDraggingRef.current && !isPanningRef.current && cameraRef.current && meshesGroupRef.current && canvasMountRef.current) {
      const rect = canvasMountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);

      let isOverFurniture = false;
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && current !== meshesGroupRef.current) {
          if (current.userData && current.userData.type === 'furniture' && current.userData.id) {
            isOverFurniture = true;
            break;
          }
          current = current.parent;
        }
      }
      setIsHoveringObject(isOverFurniture);
    }

    // 3. CAMERA ORBIT / PAN / VISITOR HEAD LOOK
    if (cameraMode === 'visitor') {
      if (isDraggingRef.current) {
        visitorYawRef.current -= dx * 0.005;
        visitorPitchRef.current = Math.max(
          -Math.PI / 2.5,
          Math.min(Math.PI / 2.5, visitorPitchRef.current - dy * 0.005)
        );
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
    // Finish 3D Dragging
    if (isDraggingObjectRef.current) {
      isDraggingObjectRef.current = false;
      setIsDraggingObjectState(false);
      draggedItemIdRef.current = null;
      return;
    }

    isDraggingRef.current = false;
    isPanningRef.current = false;

    // Click to select/deselect
    const dragDist = Math.hypot(
      e.clientX - mouseDownPosRef.current.x,
      e.clientY - mouseDownPosRef.current.y
    );

    if (dragDist < 6 && cameraRef.current && meshesGroupRef.current && canvasMountRef.current) {
      const rect = canvasMountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        let foundId: string | null = null;
        while (current && current !== meshesGroupRef.current) {
          if (current.userData && current.userData.id) {
            foundId = current.userData.id;
            break;
          }
          current = current.parent;
        }
        if (foundId) {
          onSelectId(foundId);
        }
      } else {
        // Click on empty ground deselects
        onSelectId(null);
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
      let newItem: FurnitureItem = {
        id: `f_${Date.now()}`,
        catalogId: itemData.id,
        name: itemData.name,
        category: itemData.category,
        x: snappedX,
        y: snappedY,
        elevation: 0,
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
      visitorPosRef.current.addScaledVector(forward, e.deltaY < 0 ? 0.6 : -0.6);
    } else {
      const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
      sphericalRef.current.radius = Math.max(
        3,
        Math.min(45, sphericalRef.current.radius * zoomFactor)
      );
    }
  };

  // Switch to Virtual Visitor mode and place in center of primary room
  const handleSwitchToVisitor = () => {
    setCameraMode('visitor');
    const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
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

    const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === (activeFloor ?? 0)) || plan.rooms[0];
    if (targetRoom && targetRoom.points.length > 0) {
      const offset = getFloor3DOffset(targetRoom.floorLevel ?? 0);
      const avgX = (targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length) * 0.01 + offset.x;
      const avgZ = (targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length) * 0.01 + offset.z;
      visitorPosRef.current.set(avgX, offset.y + 1.6, avgZ);
    } else {
      const offset = getFloor3DOffset(activeFloor || 0);
      visitorPosRef.current.set(offset.x, offset.y + 1.6, offset.z);
    }
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
  };

  // Teleport visitor to a specific room
  const handleTeleportToRoom = (room: Room) => {
    setCameraMode('visitor');
    const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
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
    const offset = getFloor3DOffset(room.floorLevel ?? 0);
    const avgX = (room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length) * 0.01 + offset.x;
    const avgZ = (room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length) * 0.01 + offset.z;
    visitorPosRef.current.set(avgX, offset.y + 1.6, avgZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
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

  return (
    <div
      className={`relative w-full h-full bg-slate-100 overflow-hidden select-none ${
        isDraggingObjectState
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

      {/* Top 3D Viewport Controls (Compact & Cleanly aligned) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        {/* Floor Mode Selector */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setFloor3DMode('sideBySide')}
            className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
              floor3DMode === 'sideBySide'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Side-by-Side Multi-Floor View (Show Floor 1 & Floor 2 side-by-side horizontally)"
          >
            <Layers className="w-3 h-3" />
            <span>🔲 Side-by-Side</span>
          </button>
          <button
            onClick={() => setFloor3DMode('isolated')}
            className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
              floor3DMode === 'isolated'
                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={`Floor ${activeFloor} Only`}
          >
            <span>F{activeFloor} Only</span>
          </button>
          <button
            onClick={() => setFloor3DMode('stacked')}
            className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 ${
              floor3DMode === 'stacked'
                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Stack Floors Vertically"
          >
            <span>Stacked</span>
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

      {/* Room Jump Pills in Visitor Mode */}
      {cameraMode === 'visitor' && plan.rooms.length > 0 && (
        <div className="absolute top-14 right-3 z-10 flex flex-wrap gap-1 max-w-xs justify-end">
          {plan.rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleTeleportToRoom(room)}
              className="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-emerald-600 text-slate-700 hover:text-white text-[11px] font-medium border border-slate-200 shadow-sm backdrop-blur-md transition flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{room.name}</span>
            </button>
          ))}
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
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-[11px] text-slate-600 pointer-events-none shadow-md">
        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
        <span>
          {cameraMode === 'visitor'
            ? 'Virtual Visitor: Use W/A/S/D or D-Pad to walk • Drag to look 360° • Click & drag furniture to reposition'
            : '3D Drag & Drop: Click and drag any furniture piece on the floor • Press R to rotate • Drag empty space to orbit'}
        </span>
      </div>
    </div>
  );
};
