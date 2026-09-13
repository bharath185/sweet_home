'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { loadObjGeometry } from '../services/objParser';

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.0, radius: 12.0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 640;

    // 1. Three.js Scene Setup (Transparent background)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(8.5, 6.2, 8.5);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    // Warm Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    sunLight.position.set(9, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -7;
    sunLight.shadow.camera.right = 7;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.9);
    fillLight.position.set(-10, 12, -9);
    scene.add(fillLight);

    // 3. Scaled Root Room Group (Scale 0.58 guarantees zero edge cropping)
    const roomRoot = new THREE.Group();
    roomRoot.scale.set(0.58, 0.58, 0.58);
    scene.add(roomRoot);

    // Chandelier Warm Point Light
    const chandelierPoint = new THREE.PointLight(0xfef08a, 0, 10, 1.4);
    chandelierPoint.position.set(0, 2.0, 0);
    chandelierPoint.castShadow = true;
    roomRoot.add(chandelierPoint);

    // ==========================================
    // 4. MATERIALS FOR INVENTORY ITEMS
    // ==========================================
    const createWoodTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#6b4e31';
        ctx.fillRect(0, 0, 512, 512);
        for (let y = 0; y < 512; y += 32) {
          ctx.strokeStyle = '#4a331e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
          for (let x = 0; x < 512; x += 16) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
            ctx.fillRect(x, y, 16, 32);
          }
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    };

    const woodFloorMat = new THREE.MeshStandardMaterial({
      map: createWoodTexture(),
      roughness: 0.32,
      metalness: 0.08,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.02,
    });

    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Royal Navy
      roughness: 0.55,
      metalness: 0.1,
    });

    const armchairMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Terracotta Cognac
      roughness: 0.5,
      metalness: 0.12,
    });

    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Rich Walnut Wood
      roughness: 0.4,
      metalness: 0.08,
    });

    const tvUnitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark Slate Oak
      roughness: 0.45,
      metalness: 0.15,
    });

    const plantMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush Botanical Green
      roughness: 0.35,
      metalness: 0.05,
    });

    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Brushed Brass / Gold
      roughness: 0.25,
      metalness: 0.85,
    });

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033, // Warm Wood
      roughness: 0.5,
      metalness: 0.05,
    });

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Glass Blue Tint
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.7,
    });

    const bookcaseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      metalness: 0.1,
    });

    // Helper to load inventory OBJ model and scale to target meters
    const loadInventoryItem = async (
      objPath: string,
      targetW: number,
      targetD: number,
      targetH: number,
      material: THREE.Material
    ): Promise<THREE.Mesh> => {
      const geom = await loadObjGeometry(objPath);
      geom.computeBoundingBox();
      const bbox = geom.boundingBox || new THREE.Box3();
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      // Center geometry X & Z at 0, Y base at 0
      geom.translate(-center.x, -bbox.min.y, -center.z);

      const scaleX = size.x > 0 ? targetW / size.x : targetW;
      const scaleY = size.y > 0 ? targetH / size.y : targetH;
      const scaleZ = size.z > 0 ? targetD / size.z : targetD;

      const mesh = new THREE.Mesh(geom, material);
      mesh.scale.set(scaleX, scaleY, scaleZ);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // ==========================================
    // 5. STAGE 0: BLUEPRINT 2D CAD DRAFTING
    // ==========================================
    const blueprintGroup = new THREE.Group();
    roomRoot.add(blueprintGroup);

    const bpLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2.5 });
    const wallPerimeter = [
      new THREE.Vector3(-2.2, 0.01, -1.9),
      new THREE.Vector3(2.2, 0.01, -1.9),
      new THREE.Vector3(2.2, 0.01, 1.9),
      new THREE.Vector3(-2.2, 0.01, 1.9),
      new THREE.Vector3(-2.2, 0.01, -1.9),
    ];
    const bpGeom = new THREE.BufferGeometry().setFromPoints(wallPerimeter);
    const bpLine = new THREE.Line(bpGeom, bpLineMat);
    blueprintGroup.add(bpLine);

    // ==========================================
    // 6. STAGE 1: 3D WALLS & FLOOR
    // ==========================================
    const wallsGroup = new THREE.Group();
    roomRoot.add(wallsGroup);

    const floorGeom = new THREE.BoxGeometry(4.4, 0.06, 3.8);
    const roomFloor = new THREE.Mesh(floorGeom, woodFloorMat);
    roomFloor.position.set(0, -0.03, 0);
    roomFloor.receiveShadow = true;
    wallsGroup.add(roomFloor);

    // Back Wall
    const backWallGeom = new THREE.BoxGeometry(4.4, 2.4, 0.16);
    const backWall = new THREE.Mesh(backWallGeom, wallMat);
    backWall.position.set(0, 1.2, -1.9);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    // Left Wall
    const leftWallGeom = new THREE.BoxGeometry(0.16, 2.4, 3.8);
    const leftWall = new THREE.Mesh(leftWallGeom, wallMat);
    leftWall.position.set(-2.2, 1.2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    // Right Low Cutaway Wall
    const rightWallGeom = new THREE.BoxGeometry(0.16, 0.65, 3.8);
    const rightWall = new THREE.Mesh(rightWallGeom, wallMat);
    rightWall.position.set(2.2, 0.325, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    // ==========================================
    // 7. STAGE 2: INVENTORY WINDOWS & DOORS
    // ==========================================
    const architecturalFittingsGroup = new THREE.Group();
    roomRoot.add(architecturalFittingsGroup);

    // Window from inventory (/models/doubleWindow126x123.obj)
    loadInventoryItem('/models/doubleWindow126x123.obj', 1.4, 0.16, 1.25, windowMat).then((winMesh) => {
      winMesh.position.set(0.95, 0.7, -1.82);
      architecturalFittingsGroup.add(winMesh);
    });

    // Door from inventory (/models/door.obj)
    loadInventoryItem('/models/door.obj', 0.9, 0.12, 2.1, doorMat).then((doorMesh) => {
      doorMesh.rotation.y = Math.PI / 2;
      doorMesh.position.set(-2.12, 0, 0.6);
      architecturalFittingsGroup.add(doorMesh);
    });

    // ==========================================
    // 8. STAGE 3: INVENTORY CEILING LIGHTING
    // ==========================================
    const lightingGroup = new THREE.Group();
    roomRoot.add(lightingGroup);

    // Pendant Lamp from inventory (/models/pendantLamp.obj)
    loadInventoryItem('/models/pendantLamp.obj', 0.55, 0.55, 0.65, lampMat).then((lampMesh) => {
      lampMesh.position.set(0, 1.75, 0);
      lightingGroup.add(lampMesh);
    });

    // ==========================================
    // 9. STAGE 4 & 5: INVENTORY FURNITURE SUITE (NEAT PROPER ALIGNMENT & FACING)
    // ==========================================
    const furnitureGroup = new THREE.Group();
    roomRoot.add(furnitureGroup);

    // A. Luxury Sofa from inventory (/models/sofa.obj) - Rotated Math.PI (180 deg) so cushions face directly toward coffee table and TV
    loadInventoryItem('/models/sofa.obj', 2.1, 0.85, 0.82, sofaMat).then((sofaMesh) => {
      sofaMesh.rotation.y = Math.PI;
      sofaMesh.position.set(-0.1, 0, 0.82);
      furnitureGroup.add(sofaMesh);
    });

    // B. Coffee Table from inventory (/models/roundTable.obj) - Centered neatly between sofa and TV
    loadInventoryItem('/models/roundTable.obj', 0.75, 0.75, 0.42, tableMat).then((tableMesh) => {
      tableMesh.position.set(-0.1, 0, 0.02);
      furnitureGroup.add(tableMesh);
    });

    // C. Single Seater Armchair from inventory (/models/armchair.obj) - Angled correctly to face inward directly toward the coffee table
    loadInventoryItem('/models/armchair.obj', 0.8, 0.8, 0.8, armchairMat).then((chairMesh) => {
      chairMesh.rotation.y = -Math.PI * 0.70;
      chairMesh.position.set(1.15, 0, 0.1);
      furnitureGroup.add(chairMesh);
    });

    // D. TV Media Console from inventory (/models/tvUnit.obj) - Rotated Math.PI to face into the room (+Z) towards sofa
    loadInventoryItem('/models/tvUnit.obj', 1.6, 0.45, 0.5, tvUnitMat).then((tvMesh) => {
      tvMesh.rotation.y = Math.PI;
      tvMesh.position.set(-0.1, 0, -1.62);
      furnitureGroup.add(tvMesh);
    });

    // E. Bookcase Shelf from inventory (/models/bookcase.obj) - Flush against left wall, shelves facing into room (+X)
    loadInventoryItem('/models/bookcase.obj', 0.8, 0.35, 1.75, bookcaseMat).then((shelfMesh) => {
      shelfMesh.rotation.y = Math.PI / 2;
      shelfMesh.position.set(-2.0, 0, -0.6);
      furnitureGroup.add(shelfMesh);
    });

    // F. Botanical Plant from inventory (/models/plant.obj) - Perfectly placed in rear corner
    loadInventoryItem('/models/plant.obj', 0.55, 0.55, 1.35, plantMat).then((plantMesh) => {
      plantMesh.position.set(-1.65, 0, -1.45);
      furnitureGroup.add(plantMesh);
    });

    // G. Plush Woven Floor Rug - Centered under seating zone
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.98 });
    const rugMesh = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.015, 2.3), rugMat);
    rugMesh.position.set(0.0, 0.008, 0.15);
    rugMesh.receiveShadow = true;
    furnitureGroup.add(rugMesh);

    // ==========================================
    // 10. 60 FPS PROGRESSIVE ANIMATION CYCLE
    // ==========================================
    let animationId: number;
    let clock = new THREE.Clock();
    let totalTime = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      totalTime += delta;

      const loopDuration = 18.0;
      const stageIdx = Math.min(5, Math.floor((totalTime % loopDuration) / 3.0));
      const stageTime = (totalTime % 3.0);
      const stageNorm = Math.min(1.0, stageTime / 2.0);

      // Stage 0: 2D Blueprint Lines
      blueprintGroup.visible = true;
      bpLineMat.opacity = stageIdx === 0 ? 0.9 + Math.sin(totalTime * 6) * 0.1 : 0.35;
      bpLineMat.transparent = true;

      // Stage 1: 3D Walls Extrusion
      if (stageIdx >= 1) {
        wallsGroup.visible = true;
        const wallScale = stageIdx === 1 ? Math.min(1.0, stageNorm * 1.2) : 1.0;
        wallsGroup.scale.set(1, Math.max(0.01, wallScale), 1);
        wallsGroup.position.y = (1 - wallScale) * -0.5;
      } else {
        wallsGroup.visible = false;
      }

      // Stage 2: Windows & Doors
      if (stageIdx >= 2) {
        architecturalFittingsGroup.visible = true;
        const fitScale = stageIdx === 2 ? Math.min(1.0, stageNorm * 1.1) : 1.0;
        architecturalFittingsGroup.scale.set(fitScale, fitScale, fitScale);
      } else {
        architecturalFittingsGroup.visible = false;
      }

      // Stage 3: Ceiling Lighting
      if (stageIdx >= 3) {
        lightingGroup.visible = true;
        const lightProgress = stageIdx === 3 ? stageNorm : 1.0;
        chandelierPoint.intensity = lightProgress * 1.8;
      } else {
        lightingGroup.visible = false;
        chandelierPoint.intensity = 0;
      }

      // Stage 4 & 5: Luxury Furniture Suite
      if (stageIdx >= 4) {
        furnitureGroup.visible = true;
        const furnProgress = stageIdx === 4 ? Math.min(1.0, stageNorm) : 1.0;
        furnitureGroup.position.y = (1 - furnProgress) * 0.8;
        furnitureGroup.scale.set(furnProgress, furnProgress, furnProgress);
      } else {
        furnitureGroup.visible = false;
      }

      // Camera Orbit with Safe In-Bounds Rotation (Zero Edge Cropping)
      const s = cameraAngleRef.current;
      if (!isDraggingRef.current) {
        s.theta += delta * 0.12;
      }

      const camX = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const camY = s.radius * Math.cos(s.phi);
      const camZ = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0.45, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Interaction with Safe Polar Angle Clamping & Zoom
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
      s.theta -= dx * 0.007;
      s.phi = Math.max(0.45, Math.min(1.35, s.phi - dy * 0.007));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = cameraAngleRef.current;
      s.radius = Math.max(10.0, Math.min(15.0, s.radius + e.deltaY * 0.005));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

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
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[660px] flex items-center justify-center select-none overflow-visible touch-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
