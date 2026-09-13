'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  Compass,
  Check,
  Maximize2
} from 'lucide-react';
import {
  buildTableMeshGroup,
  buildSofaMeshGroup,
  buildLampMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildInteriorDecorMeshGroup,
  buildShelfMeshGroup
} from '../services/proceduralFurniture';

const STAGES = [
  { id: 0, title: '2D Blueprint Drafting', desc: 'Drawing precision CAD wall boundaries', badge: 'Step 1/5' },
  { id: 1, title: '3D Wall Extrusion', desc: 'Rising architectural structural walls', badge: 'Step 2/5' },
  { id: 2, title: 'Windows & Doors Fitting', desc: 'Installing glass glazing & entrance doors', badge: 'Step 3/5' },
  { id: 3, title: 'Ceiling Lighting & Ambiance', desc: 'Suspending pendant lamps with downlight', badge: 'Step 4/5' },
  { id: 4, title: 'Furniture & Interior Decor', desc: 'Placing luxury sofa, table & decor suite', badge: 'Step 5/5' },
  { id: 5, title: 'Fully Rendered Interior Suite', desc: 'Complete 3D WebGL architectural scene', badge: '✨ Complete' },
];

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const isPlayingRef = useRef<boolean>(true);
  isPlayingRef.current = isPlaying;

  const stageProgressRef = useRef<number>(0);
  const manualStageRef = useRef<number | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.4, radius: 7.2 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 500;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.2, 5.5);
    camera.lookAt(0, 0.9, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Ceiling spot light (activated in stage 3+)
    const ceilingSpot = new THREE.PointLight(0xfef08a, 0, 8);
    ceilingSpot.position.set(0, 2.2, 0);
    ceilingSpot.castShadow = true;
    scene.add(ceilingSpot);

    // 3. Ground & Blueprint Grid
    const groundGeom = new THREE.PlaneGeometry(8, 8);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.005;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const gridHelper = new THREE.GridHelper(8, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.001;
    scene.add(gridHelper);

    // 4. Blueprint 2D CAD Line Segments (Stage 0)
    const blueprintGroup = new THREE.Group();
    scene.add(blueprintGroup);

    const bpLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const wallPerimeter = [
      new THREE.Vector3(-2.2, 0.01, -1.8),
      new THREE.Vector3(2.2, 0.01, -1.8),
      new THREE.Vector3(2.2, 0.01, 1.8),
      new THREE.Vector3(-2.2, 0.01, 1.8),
      new THREE.Vector3(-2.2, 0.01, -1.8),
    ];
    const bpGeom = new THREE.BufferGeometry().setFromPoints(wallPerimeter);
    const bpLine = new THREE.Line(bpGeom, bpLineMat);
    blueprintGroup.add(bpLine);

    // 5. 3D Architectural Walls Group (Stage 1)
    const wallsGroup = new THREE.Group();
    scene.add(wallsGroup);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Back Wall
    const backWallGeom = new THREE.BoxGeometry(4.4, 2.4, 0.15);
    const backWall = new THREE.Mesh(backWallGeom, wallMat);
    backWall.position.set(0, 1.2, -1.8);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    // Left Wall
    const leftWallGeom = new THREE.BoxGeometry(0.15, 2.4, 3.6);
    const leftWall = new THREE.Mesh(leftWallGeom, wallMat);
    leftWall.position.set(-2.2, 1.2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    // Right Wall (Lower cutaway for 3D visibility)
    const rightWallGeom = new THREE.BoxGeometry(0.15, 0.8, 3.6);
    const rightWall = new THREE.Mesh(rightWallGeom, wallMat);
    rightWall.position.set(2.2, 0.4, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    // 6. Windows & Doors Group (Stage 2)
    const architecturalFittingsGroup = new THREE.Group();
    scene.add(architecturalFittingsGroup);

    // Window on back wall
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.7 });
    const windowMesh = buildWindowMeshGroup({ width: 120, depth: 15, height: 110, type: 'modern_sliding' }, winMat);
    windowMesh.position.set(0.6, 1.2, -1.72);
    architecturalFittingsGroup.add(windowMesh);

    // Door on left wall
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const doorMesh = buildDoorMeshGroup({ width: 85, depth: 10, height: 200, type: 'modern_flush' }, doorMat);
    doorMesh.rotation.y = Math.PI / 2;
    doorMesh.position.set(-2.12, 0, 0.4);
    architecturalFittingsGroup.add(doorMesh);

    // 7. Ceiling Lighting Fixture Group (Stage 3)
    const lightingGroup = new THREE.Group();
    scene.add(lightingGroup);

    const lampMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.2 });
    const pendantLamp = buildLampMeshGroup({ type: 'pendant_dome', shadeWidth: 38, shadeHeight: 22, totalHeight: 55 }, lampMat);
    pendantLamp.position.set(0, 1.85, 0);
    lightingGroup.add(pendantLamp);

    // 8. Interior Furniture Suite Group (Stage 4)
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);

    // Luxury Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.1 });
    const sofa = buildSofaMeshGroup({ width: 180, depth: 85, height: 78, type: 'straight_3_seater', cushionStyle: 'plump', armStyle: 'track_arm', legStyle: 'wooden_pegs' }, sofaMat);
    sofa.position.set(0, 0, 0.4);
    furnitureGroup.add(sofa);

    // Coffee Table with Decor
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, metalness: 0.1 });
    const coffeeTable = buildTableMeshGroup({ width: 90, depth: 55, height: 42, shape: 'rectangular', legStyle: '4_legs_corner', topThickness: 4, legThickness: 5, bevel: true }, tableMat);
    coffeeTable.position.set(0, 0, -0.6);
    furnitureGroup.add(coffeeTable);

    // Tabletop Plant / Decor
    const decorMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, metalness: 0.2 });
    const tableDecor = buildInteriorDecorMeshGroup({ width: 25, depth: 25, height: 25, type: 'potted_plant' }, decorMat);
    tableDecor.position.set(0, 0.42, -0.6);
    furnitureGroup.add(tableDecor);

    // Wall Floating Shelf on back wall
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const shelf = buildShelfMeshGroup({ width: 90, depth: 20, height: 18, type: 'floating' }, shelfMat);
    shelf.position.set(-1.1, 1.4, -1.7);
    furnitureGroup.add(shelf);

    // Soft Floor Rug
    const rugGeom = new THREE.PlaneGeometry(2.4, 1.8);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
    const rugMesh = new THREE.Mesh(rugGeom, rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(0, 0.005, -0.1);
    rugMesh.receiveShadow = true;
    furnitureGroup.add(rugMesh);

    // 9. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();
    let totalTime = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlayingRef.current) {
        totalTime += delta;
      }

      // Loop over 18 seconds (3 seconds per stage)
      const loopDuration = 18.0;
      const stageIdx = manualStageRef.current !== null
        ? manualStageRef.current
        : Math.min(5, Math.floor((totalTime % loopDuration) / 3.0));

      const stageTime = (totalTime % 3.0);
      const stageNorm = Math.min(1.0, stageTime / 2.0); // 0 to 1 over first 2s of stage

      setCurrentStage(stageIdx);

      // --- Stage 0: 2D Blueprint Lines ---
      blueprintGroup.visible = true;
      bpLineMat.opacity = stageIdx === 0 ? 0.9 + Math.sin(totalTime * 6) * 0.1 : 0.4;
      bpLineMat.transparent = true;

      // --- Stage 1: 3D Walls Extrusion ---
      if (stageIdx >= 1) {
        wallsGroup.visible = true;
        const wallScale = stageIdx === 1 ? Math.min(1.0, stageNorm * 1.2) : 1.0;
        wallsGroup.scale.set(1, Math.max(0.01, wallScale), 1);
        wallsGroup.position.y = (1 - wallScale) * -0.5;
      } else {
        wallsGroup.visible = false;
      }

      // --- Stage 2: Windows & Doors Fitting ---
      if (stageIdx >= 2) {
        architecturalFittingsGroup.visible = true;
        const fitScale = stageIdx === 2 ? Math.min(1.0, stageNorm * 1.1) : 1.0;
        architecturalFittingsGroup.scale.set(fitScale, fitScale, fitScale);
      } else {
        architecturalFittingsGroup.visible = false;
      }

      // --- Stage 3: Ceiling Lighting & Spot ---
      if (stageIdx >= 3) {
        lightingGroup.visible = true;
        ceilingSpot.intensity = stageIdx === 3 ? stageNorm * 1.6 : 1.6;
      } else {
        lightingGroup.visible = false;
        ceilingSpot.intensity = 0;
      }

      // --- Stage 4 & 5: Furniture Assembly & Full Scene ---
      if (stageIdx >= 4) {
        furnitureGroup.visible = true;
        const furnProgress = stageIdx === 4 ? Math.min(1.0, stageNorm) : 1.0;
        furnitureGroup.position.y = (1 - furnProgress) * 0.8;
        furnitureGroup.scale.set(furnProgress, furnProgress, furnProgress);
      } else {
        furnitureGroup.visible = false;
      }

      // Camera Orbit Animation
      const s = cameraAngleRef.current;
      if (!isDraggingRef.current) {
        // Slow cinematic orbit
        s.theta += delta * 0.12;
      }

      const camX = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const camY = s.radius * Math.cos(s.phi);
      const camZ = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0.8, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Drag Listeners for Interactive 3D Orbit
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      const s = cameraAngleRef.current;
      s.theta -= dx * 0.008;
      s.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, s.phi - dy * 0.008));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize listener
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const activeStageObj = STAGES[currentStage] || STAGES[0];

  const handleSelectStage = (idx: number) => {
    manualStageRef.current = idx;
    setCurrentStage(idx);
    setIsPlaying(false);
  };

  const handleResetLoop = () => {
    manualStageRef.current = null;
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-[460px] lg:h-[580px] bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Stage Indicator Badge */}
      <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between pointer-events-none">
        <div className="bg-[#0b1120] border border-slate-800 p-3 rounded-2xl shadow-xl max-w-sm pointer-events-auto animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
              {activeStageObj.badge}
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {activeStageObj.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {activeStageObj.desc}
          </p>
        </div>

        {/* Orbit Hint Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1120] border border-slate-800 text-[10px] text-slate-400">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Click & Drag 360° Orbit</span>
        </div>
      </div>

      {/* Bottom Interactive Step Scrubber & Playback Controls */}
      <div className="relative z-10 p-4 sm:p-5 bg-[#0b1120] border-t border-slate-800 flex flex-col gap-2.5">
        
        {/* Step Progression Chips */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {STAGES.map((s, idx) => {
            const isActive = currentStage === idx;
            const isCompleted = currentStage > idx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`px-1 sm:px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/30 ring-1 ring-sky-300/40'
                    : isCompleted
                    ? 'bg-slate-800/80 text-sky-300 border-slate-700 hover:bg-slate-800'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800/80 hover:bg-slate-900 hover:text-slate-300'
                }`}
                title={s.title}
              >
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <Check className="w-2.5 h-2.5 text-sky-400 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="truncate max-w-full hidden md:inline text-[9px] font-normal">
                  {idx === 0 ? '2D CAD' : idx === 1 ? '3D Walls' : idx === 2 ? 'Windows' : idx === 3 ? 'Lighting' : idx === 4 ? 'Furniture' : 'Interior'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Play / Pause and Auto-Loop Controller Bar */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                manualStageRef.current = null;
                setIsPlaying(!isPlaying);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 font-semibold text-xs border border-slate-700 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isPlaying ? 'Pause Animation' : 'Resume Auto-Tour'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetLoop}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 border border-slate-700/60 cursor-pointer"
              title="Reset to 2D Blueprint step"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay From 2D</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive WebGL 60 FPS</span>
          </div>
        </div>

      </div>

    </div>
  );
};
