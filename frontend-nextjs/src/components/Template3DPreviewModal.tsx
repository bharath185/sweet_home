'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Button, Tag, Space, Tooltip } from 'antd';
import {
  CompassOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  BorderOutlined,
  RotateLeftOutlined,
} from '@ant-design/icons';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSafeWebGLRenderer, safelyDisposeRenderer } from '../services/webglHelper';
import { FloorTemplate, HomePlan, Wall, Room, FurnitureItem } from '../types/plan';
import {
  studioPlan,
  oneBedroomAptPlan,
  twoBedroomAptPlan,
  threeBedroomAptPlan,
  emptyHomePlan,
  bowWindowAptPlan,
  houseWithBasementPlan,
  houseWithAtticPlan,
  houseWithMezzaninePlan,
  DECOFROG_DEMOS,
} from '../services/demoPlans';
import { sarahPlan, davidPlan, emmaPlan } from '../services/api';

interface Template3DPreviewModalProps {
  isOpen: boolean;
  template: FloorTemplate | null;
  onClose: () => void;
  onOpenInStudio: (templateId: string) => void;
  theme?: 'dark' | 'light';
}

// Fail-safe plan resolver: guarantees a valid plan is ALWAYS returned
function resolvePlanData(tpl: FloorTemplate | null): HomePlan {
  if (!tpl) return studioPlan;
  if (tpl.data && (tpl.data.walls?.length || tpl.data.rooms?.length)) return tpl.data;
  if (tpl.plan && (tpl.plan.walls?.length || tpl.plan.rooms?.length)) return tpl.plan;

  const id = tpl.id || '';
  if (id === 'studio') return studioPlan;
  if (id === '1-bedroom-apt') return oneBedroomAptPlan;
  if (id === '2-bedroom-apt') return twoBedroomAptPlan;
  if (id === '3-bedroom-apt') return threeBedroomAptPlan;
  if (id === 'empty-home') return emptyHomePlan;
  if (id === 'bow-window-apt') return bowWindowAptPlan;
  if (id.includes('basement')) return houseWithBasementPlan;
  if (id.includes('attic')) return houseWithAtticPlan;
  if (id.includes('mezzanine')) return houseWithMezzaninePlan;
  if (id === 'starter-sarah-suite') return sarahPlan;
  if (id === 'starter-david-villa') return davidPlan;
  if (id === 'starter-emma-studio') return emmaPlan;

  const demo = DECOFROG_DEMOS.find((d) => d.id === id);
  if (demo?.plan) return demo.plan;

  return studioPlan;
}

// Procedural materials with safe fallback
function getWoodMaterial(wireframe: boolean): THREE.MeshStandardMaterial {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#b88655';
      ctx.fillRect(0, 0, 256, 256);
      const tones = ['#c89666', '#a87545', '#bf8e5c', '#9e6d3e'];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = tones[(r + c * 2) % tones.length];
          ctx.fillRect(c * 64 + 1, r * 32 + 1, 62, 30);
          ctx.strokeStyle = '#5a3d1c';
          ctx.lineWidth = 1;
          ctx.strokeRect(c * 64, r * 32, 64, 32);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.45,
        metalness: 0.08,
        wireframe,
        side: THREE.DoubleSide,
      });
    }
  } catch {}
  return new THREE.MeshStandardMaterial({
    color: 0xc89666,
    roughness: 0.45,
    wireframe,
    side: THREE.DoubleSide,
  });
}

function getTileMaterial(type: 'bath' | 'kitchen', wireframe: boolean): THREE.MeshStandardMaterial {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const isBath = type === 'bath';
      ctx.fillStyle = isBath ? '#e2e8f0' : '#1e293b';
      ctx.fillRect(0, 0, 128, 128);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = isBath
            ? (r + c) % 2 === 0 ? '#f8fafc' : '#f1f5f9'
            : (r + c) % 2 === 0 ? '#334155' : '#263345';
          ctx.fillRect(c * 32 + 1, r * 32 + 1, 30, 30);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.3,
        metalness: 0.1,
        wireframe,
        side: THREE.DoubleSide,
      });
    }
  } catch {}
  return new THREE.MeshStandardMaterial({
    color: type === 'bath' ? 0xe2e8f0 : 0x334155,
    roughness: 0.3,
    wireframe,
    side: THREE.DoubleSide,
  });
}

export const Template3DPreviewModal: React.FC<Template3DPreviewModalProps> = ({
  isOpen,
  template,
  onClose,
  onOpenInStudio,
  theme = 'light',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [viewPreset, setViewPreset] = useState<'iso' | 'top' | 'front'>('iso');

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);

  // Guarantees non-null plan data
  const activePlan: HomePlan = resolvePlanData(template);

  // Build realistic 3D architectural geometry: textured floors, volumetric walls, real furniture
  const buildSceneGeometry = useCallback((plan: HomePlan, wireframe: boolean) => {
    const group = new THREE.Group();

    // 1. WALLS
    const walls: Wall[] = plan.walls || [];
    const wallBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6,
      metalness: 0.05,
      wireframe,
      side: THREE.DoubleSide,
    });

    const wallCapMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.15,
      wireframe,
    });

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
      wireframe,
    });

    walls.forEach((wall) => {
      const startX = wall.xStart ?? (wall as any).startX ?? 0;
      const startY = wall.yStart ?? (wall as any).startY ?? 0;
      const endX = wall.xEnd ?? (wall as any).endX ?? 0;
      const endY = wall.yEnd ?? (wall as any).endY ?? 0;

      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length < 1) return;

      const height = wall.height || 260;
      const thickness = wall.thickness || 15;
      const angle = Math.atan2(dy, dx);
      const midX = (startX + endX) / 2;
      const midZ = (startY + endY) / 2;

      // Main wall box
      const wallGeo = new THREE.BoxGeometry(length, height, thickness);
      const wallMesh = new THREE.Mesh(wallGeo, wallBodyMat);
      wallMesh.position.set(midX, height / 2, midZ);
      wallMesh.rotation.y = -angle;
      group.add(wallMesh);

      // Architectural top coping trim (CAD cutaway style)
      const capGeo = new THREE.BoxGeometry(length + 1, 4, thickness + 3);
      const capMesh = new THREE.Mesh(capGeo, wallCapMat);
      capMesh.position.set(midX, height + 2, midZ);
      capMesh.rotation.y = -angle;
      group.add(capMesh);

      // Bottom baseboard
      const baseGeo = new THREE.BoxGeometry(length, 8, thickness + 1);
      const baseMesh = new THREE.Mesh(baseGeo, baseboardMat);
      baseMesh.position.set(midX, 4, midZ);
      baseMesh.rotation.y = -angle;
      group.add(baseMesh);
    });

    // 2. ROOMS & FLOORS WITH REAL TEXTURES
    const rooms: Room[] = plan.rooms || [];
    const woodMat = getWoodMaterial(wireframe);
    const bathMat = getTileMaterial('bath', wireframe);
    const kitchenMat = getTileMaterial('kitchen', wireframe);

    rooms.forEach((room) => {
      if (room.points && room.points.length >= 3) {
        const shape = new THREE.Shape();
        shape.moveTo(room.points[0].x, -room.points[0].y);
        for (let i = 1; i < room.points.length; i++) {
          shape.lineTo(room.points[i].x, -room.points[i].y);
        }
        shape.closePath();

        const floorGeo = new THREE.ShapeGeometry(shape);
        const name = (room.name || '').toLowerCase();

        let mat = woodMat;
        if (name.includes('bath') || name.includes('toilet') || name.includes('spa')) {
          mat = bathMat;
        } else if (name.includes('kitchen')) {
          mat = kitchenMat;
        }

        const floorMesh = new THREE.Mesh(floorGeo, mat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = 0.5;
        group.add(floorMesh);
      }
    });

    // 3. REALISTIC VOLUMETRIC FURNITURE
    const furniture: FurnitureItem[] = plan.furniture || [];

    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.4 });
    const whiteFabricMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const navyFabricMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
    const cognacLeatherMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 });
    const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.85 });
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
    const greenPlantMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

    furniture.forEach((item) => {
      const width = item.width || 80;
      const depth = item.depth || 80;
      const height = item.height || 60;
      const cat = (item.category || item.name || '').toLowerCase();

      const furGroup = new THREE.Group();
      furGroup.position.set(item.x || 0, item.elevation || 0, item.y || 0);
      if (item.angle !== undefined) {
        furGroup.rotation.y = -item.angle;
      } else if ((item as any).rotation) {
        furGroup.rotation.y = -((item as any).rotation * Math.PI) / 180;
      }

      // BED
      if (cat.includes('bed')) {
        const base = new THREE.Mesh(new THREE.BoxGeometry(width, 22, depth), darkWoodMat);
        base.position.y = 11;
        furGroup.add(base);

        const head = new THREE.Mesh(new THREE.BoxGeometry(width, 65, 8), darkWoodMat);
        head.position.set(0, 32.5, -depth / 2 + 4);
        furGroup.add(head);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, 18, depth * 0.9), whiteFabricMat);
        mattress.position.set(0, 29, 2);
        furGroup.add(mattress);

        const duvet = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 12, depth * 0.56), navyFabricMat);
        duvet.position.set(0, 38, depth * 0.18);
        furGroup.add(duvet);

        const pillowW = width * 0.38;
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(pillowW, 8, depth * 0.2), whiteFabricMat);
        p1.position.set(-width * 0.24, 40, -depth * 0.28);
        const p2 = p1.clone();
        p2.position.set(width * 0.24, 40, -depth * 0.28);
        furGroup.add(p1, p2);
      }
      // SOFA / COUCH
      else if (cat.includes('sofa') || cat.includes('couch') || cat.includes('armchair')) {
        const isArmchair = cat.includes('armchair');
        const sofaMat = isArmchair ? cognacLeatherMat : charcoalMat;

        const base = new THREE.Mesh(new THREE.BoxGeometry(width, 18, depth), sofaMat);
        base.position.y = 9;
        furGroup.add(base);

        const back = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.75, depth * 0.24), sofaMat);
        back.position.set(0, height * 0.45, -depth * 0.38);
        furGroup.add(back);

        const armW = depth * 0.18;
        const armL = new THREE.Mesh(new THREE.BoxGeometry(armW, height * 0.55, depth), sofaMat);
        armL.position.set(-width / 2 + armW / 2, height * 0.35, 0);
        const armR = armL.clone();
        armR.position.set(width / 2 - armW / 2, height * 0.35, 0);
        furGroup.add(armL, armR);

        const cushionCount = isArmchair ? 1 : 2;
        const cWidth = (width - armW * 2) / cushionCount;
        for (let i = 0; i < cushionCount; i++) {
          const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(cWidth - 2, 10, depth * 0.65),
            sofaMat
          );
          const cX = -(width - armW * 2) / 2 + cWidth * (i + 0.5);
          cushion.position.set(cX, 23, 2);
          furGroup.add(cushion);
        }
      }
      // TABLE / DESK
      else if (cat.includes('table') || cat.includes('desk')) {
        const isCoffee = height < 55;
        const top = new THREE.Mesh(
          new THREE.BoxGeometry(width, 6, depth),
          isCoffee ? marbleMat : darkWoodMat
        );
        top.position.y = height - 3;
        furGroup.add(top);

        const legRadius = 2.5;
        const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.8, height - 6);
        const legOffsetW = width / 2 - 6;
        const legOffsetD = depth / 2 - 6;

        [
          [-legOffsetW, -legOffsetD],
          [legOffsetW, -legOffsetD],
          [-legOffsetW, legOffsetD],
          [legOffsetW, legOffsetD],
        ].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, chromeMat);
          leg.position.set(lx, (height - 6) / 2, lz);
          furGroup.add(leg);
        });
      }
      // KITCHEN / CABINET
      else if (cat.includes('kitchen') || cat.includes('cabinet') || cat.includes('wardrobe') || cat.includes('fridge')) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), charcoalMat);
        body.position.y = height / 2;
        furGroup.add(body);

        if (!cat.includes('wardrobe') && !cat.includes('fridge')) {
          const top = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 4, depth + 2), marbleMat);
          top.position.y = height + 2;
          furGroup.add(top);
        }
      }
      // BATH / TOILET / SHOWER
      else if (cat.includes('bath') || cat.includes('toilet') || cat.includes('washbasin') || cat.includes('sink')) {
        const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), porcelainMat);
        body.position.y = height / 2;
        furGroup.add(body);

        const faucet = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 14), chromeMat);
        faucet.position.set(0, height + 7, -depth * 0.35);
        furGroup.add(faucet);
      }
      // PLANT
      else if (cat.includes('plant')) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.4, width * 0.3, height * 0.4), whiteFabricMat);
        pot.position.y = height * 0.2;
        furGroup.add(pot);

        const foliage = new THREE.Mesh(new THREE.SphereGeometry(width * 0.5, 12, 12), greenPlantMat);
        foliage.position.y = height * 0.7;
        furGroup.add(foliage);
      }
      // RUG / MAT
      else if (cat.includes('rug') || cat.includes('bathmat')) {
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
        const rug = new THREE.Mesh(new THREE.BoxGeometry(width, 2, depth), rugMat);
        rug.position.y = 1;
        furGroup.add(rug);
      }
      // DEFAULT FALLBACK
      else {
        const def = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), charcoalMat);
        def.position.y = height / 2;
        furGroup.add(def);
      }

      group.add(furGroup);
    });

    // Fallback if plan has 0 walls
    if (walls.length === 0) {
      const baseGeo = new THREE.BoxGeometry(500, 12, 400);
      const baseMesh = new THREE.Mesh(baseGeo, woodMat);
      baseMesh.position.set(0, 6, 0);
      group.add(baseMesh);
    }

    return group;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth || 940;
    const height = mount.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // 2. Camera: Immediately initialize with valid non-zero isometric position
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
    camera.position.set(650, 550, 650);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = createSafeWebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    if (!renderer) return;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls: Guaranteed valid target
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 1.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 4500;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting: High-visibility studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.6);
    hemiLight.position.set(0, 600, 0);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffbeb, 1.15);
    dirLight1.position.set(500, 800, 400);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.45);
    dirLight2.position.set(-400, 500, -350);
    scene.add(dirLight2);

    // 6. Crisp Architectural Grid Floor
    const gridHelper = new THREE.GridHelper(1800, 36, 0x818cf8, 0x334155);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // 7. Building geometry
    const building = buildSceneGeometry(activePlan, isWireframe);
    buildingGroupRef.current = building;
    scene.add(building);

    // Frame building bounding box
    const box = new THREE.Box3().setFromObject(building);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z, 220);

    controls.target.set(center.x, 0, center.z);
    camera.position.set(
      center.x + maxDim * 1.25,
      maxDim * 0.95,
      center.z + maxDim * 1.25
    );
    camera.lookAt(center.x, 0, center.z);
    controls.update();

    // 8. Animation Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const updateSize = () => {
      if (!mount || !renderer || !camera) return;
      const curW = mount.clientWidth;
      const curH = mount.clientHeight;
      if (curW > 0 && curH > 0) {
        camera.aspect = curW / curH;
        camera.updateProjectionMatrix();
        renderer.setSize(curW, curH, false);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(mount);

    const t1 = setTimeout(updateSize, 80);
    const t2 = setTimeout(updateSize, 250);
    const t3 = setTimeout(updateSize, 500);

    return () => {
      isRunning = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      safelyDisposeRenderer(renderer, mount);
    };
  }, [isOpen, template, isWireframe, buildSceneGeometry]);

  // Handle auto-rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  // Handle wireframe toggle
  useEffect(() => {
    if (!sceneRef.current || !buildingGroupRef.current) return;
    sceneRef.current.remove(buildingGroupRef.current);
    const updated = buildSceneGeometry(activePlan, isWireframe);
    buildingGroupRef.current = updated;
    sceneRef.current.add(updated);
  }, [isWireframe, activePlan, buildSceneGeometry]);

  // Camera presets
  const handleSetPreset = (preset: 'iso' | 'top' | 'front') => {
    if (!controlsRef.current || !cameraRef.current || !buildingGroupRef.current) return;
    setViewPreset(preset);
    setIsAutoRotating(false);

    const box = new THREE.Box3().setFromObject(buildingGroupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.z, 220);

    controlsRef.current.target.set(center.x, 0, center.z);

    if (preset === 'top') {
      cameraRef.current.position.set(center.x, maxDim * 2.1, center.z + 0.01);
    } else if (preset === 'front') {
      cameraRef.current.position.set(center.x, maxDim * 0.45, center.z + maxDim * 1.8);
    } else {
      cameraRef.current.position.set(
        center.x + maxDim * 1.25,
        maxDim * 0.95,
        center.z + maxDim * 1.25
      );
    }
    controlsRef.current.update();
  };

  if (!template) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      styles={{
        body: {
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#0f172a',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 620, background: '#0f172a' }}>
        {/* Header Bar */}
        <div
          style={{
            height: 56,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            background: '#0b1120',
            zIndex: 10,
          }}
        >
          <Space size={10}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <CompassOutlined />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                {template.name}
                <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, margin: 0, fontSize: 10 }}>
                  {template.category || 'Apartment'}
                </Tag>
                <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, margin: 0, fontSize: 10 }}>
                  {template.area || 'Spacious'}
                </Tag>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                Realistic 3D Architectural Turntable • Click & drag to rotate 360° • Scroll to zoom
              </div>
            </div>
          </Space>

          <Space size={8}>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() => {
                onClose();
                onOpenInStudio(template.id);
              }}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                fontWeight: 700,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
              }}
            >
              Open in 3D Studio
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{
                borderRadius: 8,
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
              }}
            />
          </Space>
        </div>

        {/* 3D WebGL Canvas Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: 564, minHeight: 480 }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

          {/* Floating HUD Controls */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              display: 'flex',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid rgba(51, 65, 85, 0.9)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
              zIndex: 5,
            }}
          >
            <Tooltip title={isAutoRotating ? 'Pause 360° Turntable' : 'Play 360° Turntable'}>
              <Button
                size="small"
                type={isAutoRotating ? 'primary' : 'default'}
                icon={isAutoRotating ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                style={{
                  borderRadius: 6,
                  fontSize: 11,
                  background: isAutoRotating ? '#4f46e5' : '#1e293b',
                  color: '#fff',
                  border: 'none',
                }}
              >
                {isAutoRotating ? 'Rotating' : 'Paused'}
              </Button>
            </Tooltip>

            <Tooltip title="Toggle Wireframe CAD Mode">
              <Button
                size="small"
                type={isWireframe ? 'primary' : 'default'}
                icon={<BorderOutlined />}
                onClick={() => setIsWireframe(!isWireframe)}
                style={{
                  borderRadius: 6,
                  fontSize: 11,
                  background: isWireframe ? '#7c3aed' : '#1e293b',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Wireframe
              </Button>
            </Tooltip>

            <div style={{ width: 1, height: 18, background: '#334155', alignSelf: 'center', margin: '0 2px' }} />

            <Space size={4}>
              <Tooltip title="Isometric 3D View">
                <Button
                  size="small"
                  type={viewPreset === 'iso' ? 'primary' : 'text'}
                  onClick={() => handleSetPreset('iso')}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    color: viewPreset === 'iso' ? '#fff' : '#94a3b8',
                    background: viewPreset === 'iso' ? '#3b82f6' : 'transparent',
                  }}
                >
                  3D Iso
                </Button>
              </Tooltip>
              <Tooltip title="Top-Down 2D Blueprint View">
                <Button
                  size="small"
                  type={viewPreset === 'top' ? 'primary' : 'text'}
                  onClick={() => handleSetPreset('top')}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    color: viewPreset === 'top' ? '#fff' : '#94a3b8',
                    background: viewPreset === 'top' ? '#3b82f6' : 'transparent',
                  }}
                >
                  Top 2D
                </Button>
              </Tooltip>
              <Tooltip title="Eye-Level Front Perspective">
                <Button
                  size="small"
                  type={viewPreset === 'front' ? 'primary' : 'text'}
                  onClick={() => handleSetPreset('front')}
                  style={{
                    borderRadius: 6,
                    fontSize: 11,
                    color: viewPreset === 'front' ? '#fff' : '#94a3b8',
                    background: viewPreset === 'front' ? '#3b82f6' : 'transparent',
                  }}
                >
                  Eye Level
                </Button>
              </Tooltip>
            </Space>
          </div>

          {/* Quick instructions pill at bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '5px 14px',
              borderRadius: 20,
              border: '1px solid rgba(51, 65, 85, 0.7)',
              color: '#94a3b8',
              fontSize: 11,
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Left-click + drag to rotate</span>
            <span>•</span>
            <span>Right-click + drag to pan</span>
            <span>•</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
