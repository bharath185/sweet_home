'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  X,
  Box,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  Plus,
  Compass,
  Check,
  Layers,
  Sun,
  Camera,
  Play,
  Pause,
  Grid,
  Info
} from 'lucide-react';
import { CatalogItem } from '../types/plan';
import { buildProceduralMeshGroup } from '../services/proceduralFurniture';
import { loadObjGeometry } from '../services/objParser';

interface Catalog3DPreviewModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddItem?: (item: CatalogItem) => void;
}

const CM = 0.01;

const FINISH_PRESETS = [
  { name: 'Original', color: '', roughness: 0.5, metalness: 0.1 },
  { name: 'Natural Oak', color: '#d4a373', roughness: 0.7, metalness: 0.05 },
  { name: 'Rich Walnut', color: '#5c3d2e', roughness: 0.45, metalness: 0.05 },
  { name: 'Navy Velvet', color: '#1e3a8a', roughness: 0.5, metalness: 0.2 },
  { name: 'Emerald Velvet', color: '#064e3b', roughness: 0.5, metalness: 0.2 },
  { name: 'Jet Black Nappa', color: '#18181b', roughness: 0.35, metalness: 0.15 },
  { name: 'Cognac Leather', color: '#9a3412', roughness: 0.45, metalness: 0.1 },
  { name: 'Brushed Brass', color: '#eab308', roughness: 0.25, metalness: 0.85 },
  { name: 'Polished Chrome', color: '#cbd5e1', roughness: 0.08, metalness: 0.95 },
  { name: 'Carrara Marble', color: '#f1f5f9', roughness: 0.15, metalness: 0.05 },
  { name: 'Smoked Glass', color: '#1e293b', roughness: 0.1, metalness: 0.15, opacity: 0.6 },
];

export const Catalog3DPreviewModal: React.FC<Catalog3DPreviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [roughness, setRoughness] = useState<number>(0.5);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // 3D Canvas Refs
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const pedestalMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ radius: 3.0, theta: 0.75, phi: 1.15, target: new THREE.Vector3(0, 0.4, 0) });

  // Sync initial color with item defaults
  useEffect(() => {
    if (item) {
      setSelectedColor(item.defaultColor || '');
      setRoughness(0.5);
      setMetalness(0.1);
      setOpacity(1.0);
      setAddedSuccess(false);
    }
  }, [item]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Update Camera based on Orbit spherical coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi, target } = orbitRef.current;
    const clampedPhi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, phi));
    orbitRef.current.phi = clampedPhi;

    const x = target.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(clampedPhi);
    const z = target.z + radius * Math.sin(clampedPhi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // Set camera to preset angles
  const setPresetView = (view: 'iso' | 'front' | 'top' | 'side' | 'back') => {
    setIsAutoRotating(false);
    if (!item) return;
    const maxDim = Math.max(item.width, item.depth, item.height) * CM;
    const dist = Math.max(1.8, maxDim * 2.5);
    orbitRef.current.radius = dist;
    orbitRef.current.target.set(0, (item.height * CM) / 2, 0);

    if (view === 'iso') {
      orbitRef.current.theta = 0.75;
      orbitRef.current.phi = 1.1;
    } else if (view === 'front') {
      orbitRef.current.theta = 0;
      orbitRef.current.phi = 1.45;
    } else if (view === 'top') {
      orbitRef.current.theta = 0;
      orbitRef.current.phi = 0.05;
    } else if (view === 'side') {
      orbitRef.current.theta = Math.PI / 2;
      orbitRef.current.phi = 1.45;
    } else if (view === 'back') {
      orbitRef.current.theta = Math.PI;
      orbitRef.current.phi = 1.45;
    }
    updateCameraPosition();
  };

  // Build model geometry and add to scene
  const rebuildModel = useCallback(() => {
    if (!sceneRef.current || !item) return;

    // Clear old model group
    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      modelGroupRef.current = null;
    }

    const group = new THREE.Group();
    const currentColor = selectedColor || item.defaultColor || '#94a3b8';
    const isTranslucent = opacity < 0.99;

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentColor),
      roughness: roughness,
      metalness: metalness,
      wireframe: isWireframe,
      transparent: isTranslucent,
      opacity: opacity,
      side: THREE.DoubleSide,
    });

    const wCm = item.width;
    const dCm = item.depth;
    const hCm = item.height;

    // Center target for orbit
    orbitRef.current.target.set(0, (hCm * CM) / 2, 0);
    const maxDim = Math.max(wCm, dCm, hCm) * CM;
    orbitRef.current.radius = Math.max(2.2, maxDim * 2.8);

    if (item.model && item.model.startsWith('procedural:')) {
      try {
        const parts = item.model.split(':');
        const pType = parts[1];
        const rawParams = parts.slice(2).join(':');
        const parsed = rawParams ? JSON.parse(rawParams) : {};
        const procGroup = buildProceduralMeshGroup(pType, parsed, wCm, dCm, hCm, material);
        group.add(procGroup);
      } catch (e) {
        const geom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.y = (hCm * CM) / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    } else if (
      item.model &&
      (item.model.endsWith('.obj') || item.model.startsWith('local_obj:') || item.model.startsWith('data:'))
    ) {
      loadObjGeometry(item.model)
        .then((geom) => {
          geom.computeBoundingBox();
          const bbox = geom.boundingBox!;
          const size = new THREE.Vector3();
          bbox.getSize(size);

          const targetW = wCm * CM;
          const targetD = dCm * CM;
          const targetH = hCm * CM;

          const scaleX = size.x > 0 ? targetW / size.x : targetW;
          const scaleY = size.y > 0 ? targetH / size.y : targetH;
          const scaleZ = size.z > 0 ? targetD / size.z : targetD;

          const mesh = new THREE.Mesh(geom, material);
          mesh.scale.set(scaleX, scaleY, scaleZ);
          mesh.position.y = targetH / 2;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
        })
        .catch(() => {
          const geom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
          const mesh = new THREE.Mesh(geom, material);
          mesh.position.y = (hCm * CM) / 2;
          mesh.castShadow = true;
          group.add(mesh);
        });
    } else {
      const geom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
      const mesh = new THREE.Mesh(geom, material);
      mesh.position.y = (hCm * CM) / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    // Optional Lighting Spot for fixtures
    if (item.category === 'Lighting') {
      const spot = new THREE.PointLight(new THREE.Color('#fef08a'), 1.8, 6);
      spot.position.y = hCm * CM + 0.1;
      group.add(spot);
    }

    modelGroupRef.current = group;
    sceneRef.current.add(group);
    updateCameraPosition();
  }, [item, selectedColor, roughness, metalness, opacity, isWireframe, updateCameraPosition]);

  // Initialize Three.js Studio Scene
  useEffect(() => {
    if (!isOpen || !canvasMountRef.current) return;

    const container = canvasMountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1120'); // Deep dark studio environment
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.6);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainKeyLight.position.set(4, 6, 4);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.bias = -0.0005;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfae8ff, 0.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Studio Pedestal Floor
    const pedestalGeom = new THREE.CylinderGeometry(2.5, 2.6, 0.05, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.025;
    pedestal.receiveShadow = true;
    pedestalMeshRef.current = pedestal;
    scene.add(pedestal);

    // Circular Grid
    const grid = new THREE.GridHelper(5, 20, 0x4f46e5, 0x1e293b);
    grid.position.y = 0.001;
    gridHelperRef.current = grid;
    scene.add(grid);

    // Mouse Controls
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        isPanningRef.current = false;
      } else if (e.button === 2) {
        isPanningRef.current = true;
        isDraggingRef.current = false;
      }
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        orbitRef.current.theta -= dx * 0.01;
        orbitRef.current.phi -= dy * 0.01;
        updateCameraPosition();
      } else if (isPanningRef.current) {
        const panSpeed = 0.003 * orbitRef.current.radius;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        const up = new THREE.Vector3().crossVectors(right, forward).normalize();

        orbitRef.current.target.addScaledVector(right, -dx * panSpeed);
        orbitRef.current.target.addScaledVector(up, dy * panSpeed);
        updateCameraPosition();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(0.6, Math.min(10.0, orbitRef.current.radius + e.deltaY * 0.003));
      updateCameraPosition();
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    // Touch Support
    let lastTouchDist = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - prevMouseRef.current.x;
        const dy = e.touches[0].clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        orbitRef.current.theta -= dx * 0.01;
        orbitRef.current.phi -= dy * 0.01;
        updateCameraPosition();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = lastTouchDist - dist;
        lastTouchDist = dist;
        orbitRef.current.radius = Math.max(0.6, Math.min(10.0, orbitRef.current.radius + delta * 0.01));
        updateCameraPosition();
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    dom.addEventListener('touchmove', handleTouchMove, { passive: true });
    dom.addEventListener('touchend', handleTouchEnd);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Render Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isAutoRotating && !isDraggingRef.current && !isPanningRef.current) {
        orbitRef.current.theta += 0.45 * dt;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // Initial build
    rebuildModel();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('contextmenu', handleContextMenu);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isOpen]);

  // Trigger rebuild when material / item properties change
  useEffect(() => {
    if (isOpen) {
      rebuildModel();
    }
  }, [isOpen, rebuildModel]);

  // Toggle grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
    if (pedestalMeshRef.current) {
      pedestalMeshRef.current.visible = showGrid;
    }
  }, [showGrid]);

  if (!isOpen || !item) return null;

  const handleAdd = () => {
    if (onAddItem) {
      const customizedItem: CatalogItem = {
        ...item,
        defaultColor: selectedColor || item.defaultColor,
      };
      onAddItem(customizedItem);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[780px] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-slate-200">
        
        {/* =========================================================================
            LEFT / MAIN 3D VIEWPORT CANVAS
            ========================================================================= */}
        <div className="relative flex-1 h-[55%] md:h-full bg-radial from-slate-900 via-[#0a1120] to-[#050811] flex flex-col overflow-hidden">
          
          {/* Top Overlay HUD: Title & Category */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg pointer-events-auto">
              <Box className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Quick Auto-Rotate & Controls Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-slate-700/60 p-1 rounded-lg shadow-lg pointer-events-auto">
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  isAutoRotating
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isAutoRotating ? 'Pause 360° Turntable' : 'Play 360° Turntable'}
              >
                {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[11px]">{isAutoRotating ? 'Spinning' : 'Spin'}</span>
              </button>

              <button
                onClick={() => setIsWireframe(!isWireframe)}
                className={`p-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  isWireframe
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Wireframe Mesh"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  showGrid
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Studio Pedestal and Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WebGL Canvas Mount */}
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" />

          {/* Bottom HUD: Camera Angle Presets & Navigation Tips */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* View Presets */}
            <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 p-1 rounded-lg shadow-lg pointer-events-auto">
              <span className="text-[10px] font-bold text-slate-400 px-1.5 hidden sm:inline">VIEW:</span>
              <button
                onClick={() => setPresetView('iso')}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                3D Iso
              </button>
              <button
                onClick={() => setPresetView('front')}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Front
              </button>
              <button
                onClick={() => setPresetView('top')}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Top (Plan)
              </button>
              <button
                onClick={() => setPresetView('side')}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Side
              </button>
            </div>

            {/* Hint */}
            <div className="bg-slate-950/70 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono hidden md:block">
              Left Click: Rotate • Right Click: Pan • Scroll: Zoom
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT INSPECTOR & MATERIAL DRAWER
            ========================================================================= */}
        <div className="w-full md:w-80 lg:w-96 h-[45%] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0">
          
          {/* Header with Close button */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Model Inspector & Finish
              </h4>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            
            {/* Dimensions Card */}
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Model Dimensions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {((item.width * item.depth) / 10000).toFixed(2)} m² footprint
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Width</span>
                  <span className="text-xs font-bold font-mono text-white">{item.width} cm</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Depth</span>
                  <span className="text-xs font-bold font-mono text-white">{item.depth} cm</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Height</span>
                  <span className="text-xs font-bold font-mono text-white">{item.height} cm</span>
                </div>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-slate-800/60">
                  {item.description}
                </p>
              )}
            </div>

            {/* Material Finish Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Material Finish Presets</span>
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {FINISH_PRESETS.map((preset) => {
                  const isSelected = selectedColor === (preset.color || item.defaultColor);
                  return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedColor(preset.color || item.defaultColor || '#94a3b8');
                        setRoughness(preset.roughness);
                        setMetalness(preset.metalness);
                        setOpacity(preset.opacity || 1.0);
                      }}
                      className={`p-1.5 rounded-md border text-left flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-white/20 shadow-2xs"
                        style={{ backgroundColor: preset.color || item.defaultColor || '#94a3b8' }}
                      />
                      <span className="text-[11px] font-medium truncate">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color & Material Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">Custom Color Hex</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={selectedColor || item.defaultColor || '#94a3b8'}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs text-indigo-400">
                    {(selectedColor || item.defaultColor || '#94a3b8').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Roughness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Roughness (Matte / Gloss)</span>
                  <span className="font-mono text-indigo-400">{Math.round(roughness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Metalness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Metallic Reflection</span>
                  <span className="font-mono text-indigo-400">{Math.round(metalness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            {onAddItem && (
              <button
                onClick={handleAdd}
                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg cursor-pointer ${
                  addedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-1 ring-indigo-400'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Plan!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Floor Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
