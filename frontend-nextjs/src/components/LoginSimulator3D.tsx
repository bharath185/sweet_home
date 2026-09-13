'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { loadObjGeometry } from '../services/objParser';

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // User interactive camera state
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'rotate' | 'pan' | 'move_item'>('rotate');
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.0, radius: 12.5 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.45, 0));

  // Selected item manipulation state
  const selectedItemRef = useRef<THREE.Object3D | null>(null);
  const dragOffsetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 640;

    // 1. Three.js Scene Setup (Transparent canvas)
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

    // 2. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    // Warm Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    sunLight.position.set(10, 18, 11);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.9);
    fillLight.position.set(-11, 12, -10);
    scene.add(fillLight);

    // 3. Scaled Root Room Group (Scale 0.54 guarantees full visibility of the wide 5.6m room)
    const roomRoot = new THREE.Group();
    roomRoot.scale.set(0.54, 0.54, 0.54);
    scene.add(roomRoot);

    // Chandelier Warm Point Light
    const chandelierPoint = new THREE.PointLight(0xfef08a, 0, 11, 1.4);
    chandelierPoint.position.set(0, 2.0, 0);
    chandelierPoint.castShadow = true;
    roomRoot.add(chandelierPoint);

    // ==========================================
    // 4. MATERIALS
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
      tex.repeat.set(5, 3.5);
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
      color: 0x78350f, // Walnut Wood
      roughness: 0.4,
      metalness: 0.08,
    });

    const tvUnitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark Slate
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

    // Selection ring helper
    const selectionRingGeom = new THREE.RingGeometry(0.5, 0.56, 32);
    const selectionRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const selectionRing = new THREE.Mesh(selectionRingGeom, selectionRingMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.012;
    roomRoot.add(selectionRing);

    // Helper to load inventory OBJ model and scale to target meters
    const loadInventoryItem = async (
      objPath: string,
      targetW: number,
      targetD: number,
      targetH: number,
      material: THREE.Material,
      itemName: string
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
      mesh.userData = { isDraggable: true, itemName, targetW, targetD };
      return mesh;
    };

    // =========================================================================
    // 5. STAGE 0: WIDE ARCHITECTURAL 2D BLUEPRINT DRAFTING PLAN (5.60m x 3.50m)
    // =========================================================================
    const blueprintGroup = new THREE.Group();
    roomRoot.add(blueprintGroup);

    const bpCyanBold = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3, transparent: true, opacity: 0.95 });
    const bpCyanFine = new THREE.LineBasicMaterial({ color: 0x0369a1, linewidth: 1.5, transparent: true, opacity: 0.75 });
    const bpDashedMat = new THREE.LineDashedMaterial({ color: 0x0284c7, dashSize: 0.08, gapSize: 0.05, linewidth: 1.5, transparent: true, opacity: 0.85 });
    const bpDimMat = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.5, transparent: true, opacity: 0.8 });

    const createLine = (pts: THREE.Vector3[], mat: THREE.Material) => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      if (mat instanceof THREE.LineDashedMaterial) {
        const line = new THREE.Line(geom, mat);
        line.computeLineDistances();
        return line;
      }
      return new THREE.Line(geom, mat);
    };

    // A. Wide Double-Line Structural Exterior & Interior Walls (5.6m x 3.5m)
    // Outer perimeter: X from -2.8 to +2.8, Z from -1.75 to +1.75
    const outerWallPts = [
      new THREE.Vector3(-2.8, 0.015, -1.75),
      new THREE.Vector3(2.8, 0.015, -1.75),
      new THREE.Vector3(2.8, 0.015, 1.75),
      new THREE.Vector3(-2.8, 0.015, 1.75),
      new THREE.Vector3(-2.8, 0.015, -1.75),
    ];
    blueprintGroup.add(createLine(outerWallPts, bpCyanBold));

    // Inner perimeter (Wall thickness: 0.16m)
    const innerWallPts = [
      new THREE.Vector3(-2.64, 0.015, -1.59),
      new THREE.Vector3(2.64, 0.015, -1.59),
      new THREE.Vector3(2.64, 0.015, 1.59),
      new THREE.Vector3(-2.64, 0.015, 1.59),
      new THREE.Vector3(-2.64, 0.015, -1.59),
    ];
    blueprintGroup.add(createLine(innerWallPts, bpCyanBold));

    // B. Architectural Door Swing Arc (Left Wall at Z = 0.5)
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, 0.016, 0.05), new THREE.Vector3(-2.64, 0.016, 0.05)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, 0.016, 0.95), new THREE.Vector3(-2.64, 0.016, 0.95)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(-2.64, 0.016, 0.05), new THREE.Vector3(-1.74, 0.016, 0.05)], bpCyanBold));

    const doorArcPts: THREE.Vector3[] = [];
    const doorRadius = 0.9;
    const doorHinge = new THREE.Vector3(-2.64, 0.016, 0.05);
    for (let a = 0; a <= Math.PI / 2; a += Math.PI / 24) {
      doorArcPts.push(new THREE.Vector3(
        doorHinge.x + doorRadius * Math.cos(a),
        0.016,
        doorHinge.z + doorRadius * Math.sin(a)
      ));
    }
    blueprintGroup.add(createLine(doorArcPts, bpDashedMat));

    // C. Architectural Window Opening on Back Wall (X = 1.4)
    blueprintGroup.add(createLine([new THREE.Vector3(0.7, 0.016, -1.75), new THREE.Vector3(0.7, 0.016, -1.59)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(2.1, 0.016, -1.75), new THREE.Vector3(2.1, 0.016, -1.59)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(0.7, 0.016, -1.67), new THREE.Vector3(2.1, 0.016, -1.67)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(0.7, 0.016, -1.63), new THREE.Vector3(2.1, 0.016, -1.63)], bpCyanFine));
    blueprintGroup.add(createLine([new THREE.Vector3(0.7, 0.016, -1.71), new THREE.Vector3(2.1, 0.016, -1.71)], bpCyanFine));

    // D. Wide Dimension Lines (5.60m x 3.50m)
    const dimTopY = 0.016;
    const dimTopZ = -2.1;
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, dimTopY, -1.75), new THREE.Vector3(-2.8, dimTopY, dimTopZ - 0.15)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(2.8, dimTopY, -1.75), new THREE.Vector3(2.8, dimTopY, dimTopZ - 0.15)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, dimTopY, dimTopZ), new THREE.Vector3(2.8, dimTopY, dimTopZ)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(-2.88, dimTopY, dimTopZ + 0.08), new THREE.Vector3(-2.72, dimTopY, dimTopZ - 0.08)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(2.72, dimTopY, dimTopZ + 0.08), new THREE.Vector3(2.88, dimTopY, dimTopZ - 0.08)], bpCyanBold));

    const dimLeftX = -3.15;
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, dimTopY, -1.75), new THREE.Vector3(dimLeftX - 0.15, dimTopY, -1.75)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(-2.8, dimTopY, 1.75), new THREE.Vector3(dimLeftX - 0.15, dimTopY, 1.75)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(dimLeftX, dimTopY, -1.75), new THREE.Vector3(dimLeftX, dimTopY, 1.75)], bpDimMat));
    blueprintGroup.add(createLine([new THREE.Vector3(dimLeftX - 0.08, dimTopY, -1.83), new THREE.Vector3(dimLeftX + 0.08, dimTopY, -1.67)], bpCyanBold));
    blueprintGroup.add(createLine([new THREE.Vector3(dimLeftX - 0.08, dimTopY, 1.67), new THREE.Vector3(dimLeftX + 0.08, dimTopY, 1.83)], bpCyanBold));

    // E. 2D Furniture Blueprint Symbols
    // 1. Sofa 2D Symbol
    const sofa2D = [
      new THREE.Vector3(-1.35, 0.015, 0.35),
      new THREE.Vector3(0.75, 0.015, 0.35),
      new THREE.Vector3(0.75, 0.015, 1.2),
      new THREE.Vector3(-1.35, 0.015, 1.2),
      new THREE.Vector3(-1.35, 0.015, 0.35),
    ];
    blueprintGroup.add(createLine(sofa2D, bpCyanFine));

    // 2. Coffee Table 2D Circle
    const tableCirclePts: THREE.Vector3[] = [];
    for (let t = 0; t <= Math.PI * 2; t += Math.PI / 16) {
      tableCirclePts.push(new THREE.Vector3(-0.3 + 0.38 * Math.cos(t), 0.015, -0.05 + 0.38 * Math.sin(t)));
    }
    blueprintGroup.add(createLine(tableCirclePts, bpCyanFine));

    // 3. Armchair 2D Symbol
    const arm2DPts = [
      new THREE.Vector3(0.8, 0.015, -0.35),
      new THREE.Vector3(1.4, 0.015, 0.25),
      new THREE.Vector3(1.1, 0.015, 0.55),
      new THREE.Vector3(0.5, 0.015, -0.05),
      new THREE.Vector3(0.8, 0.015, -0.35),
    ];
    blueprintGroup.add(createLine(arm2DPts, bpCyanFine));

    // 4. TV Media Console 2D Symbol
    const tv2DPts = [
      new THREE.Vector3(-1.1, 0.015, -1.69),
      new THREE.Vector3(0.5, 0.015, -1.69),
      new THREE.Vector3(0.5, 0.015, -1.25),
      new THREE.Vector3(-1.1, 0.015, -1.25),
      new THREE.Vector3(-1.1, 0.015, -1.69),
    ];
    blueprintGroup.add(createLine(tv2DPts, bpCyanFine));

    // F. Architectural Plan Stamp (5.60m x 3.50m)
    const createBlueprintStampTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 1024, 1024);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LIVING ROOM SUITE', 512, 420);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText('AREA: 19.60 m²  |  DIMENSIONS: 5.60m × 3.50m', 512, 465);
        ctx.fillText('SCALE: 1:50  |  VISUAL RENDERED CAD', 512, 505);

        // Top dimension text
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillText('5.60 m', 512, 105);

        // North Arrow
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(900, 200, 36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(900, 170);
        ctx.lineTo(912, 210);
        ctx.lineTo(900, 202);
        ctx.lineTo(888, 210);
        ctx.closePath();
        ctx.fill();
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('N', 900, 160);
      }
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };

    const bpStampMat = new THREE.MeshBasicMaterial({
      map: createBlueprintStampTexture(),
      transparent: true,
      opacity: 0.9,
    });
    const bpStampPlane = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.2), bpStampMat);
    bpStampPlane.rotation.x = -Math.PI / 2;
    bpStampPlane.position.set(0, 0.014, 0);
    blueprintGroup.add(bpStampPlane);

    // =========================================================================
    // 6. STAGE 1: WIDE 3D WALLS & FLOOR (5.60m x 3.50m)
    // =========================================================================
    const wallsGroup = new THREE.Group();
    roomRoot.add(wallsGroup);

    // Floor: 5.6m width x 3.5m depth
    const floorGeom = new THREE.BoxGeometry(5.6, 0.06, 3.5);
    const roomFloor = new THREE.Mesh(floorGeom, woodFloorMat);
    roomFloor.position.set(0, -0.03, 0);
    roomFloor.receiveShadow = true;
    wallsGroup.add(roomFloor);

    // Back Wall: width 5.6m, depth 0.16m at Z = -1.75
    const backWallGeom = new THREE.BoxGeometry(5.6, 2.4, 0.16);
    const backWall = new THREE.Mesh(backWallGeom, wallMat);
    backWall.position.set(0, 1.2, -1.75);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    // Left Wall: depth 3.5m, width 0.16m at X = -2.8
    const leftWallGeom = new THREE.BoxGeometry(0.16, 2.4, 3.5);
    const leftWall = new THREE.Mesh(leftWallGeom, wallMat);
    leftWall.position.set(-2.8, 1.2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    // Right Low Cutaway Wall: depth 3.5m at X = 2.8
    const rightWallGeom = new THREE.BoxGeometry(0.16, 0.65, 3.5);
    const rightWall = new THREE.Mesh(rightWallGeom, wallMat);
    rightWall.position.set(2.8, 0.325, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    // ==========================================
    // 7. STAGE 2: INVENTORY WINDOWS & DOORS
    // ==========================================
    const architecturalFittingsGroup = new THREE.Group();
    roomRoot.add(architecturalFittingsGroup);

    // Window on Back Wall (X = 1.4, Z = -1.68)
    loadInventoryItem('/models/doubleWindow126x123.obj', 1.4, 0.16, 1.25, windowMat, 'window').then((winMesh) => {
      winMesh.position.set(1.4, 0.7, -1.68);
      architecturalFittingsGroup.add(winMesh);
    });

    // Door on Left Wall (X = -2.72, Z = 0.5)
    loadInventoryItem('/models/door.obj', 0.9, 0.12, 2.1, doorMat, 'door').then((doorMesh) => {
      doorMesh.rotation.y = Math.PI / 2;
      doorMesh.position.set(-2.72, 0, 0.5);
      architecturalFittingsGroup.add(doorMesh);
    });

    // ==========================================
    // 8. STAGE 3: INVENTORY CEILING LIGHTING
    // ==========================================
    const lightingGroup = new THREE.Group();
    roomRoot.add(lightingGroup);

    // Pendant Lamp
    loadInventoryItem('/models/pendantLamp.obj', 0.55, 0.55, 0.65, lampMat, 'lamp').then((lampMesh) => {
      lampMesh.position.set(0, 1.75, 0);
      lightingGroup.add(lampMesh);
    });

    // ==========================================
    // 9. STAGE 4 & 5: INVENTORY FURNITURE SUITE (SPACIOUS WIDE ROOM)
    // ==========================================
    const furnitureGroup = new THREE.Group();
    roomRoot.add(furnitureGroup);

    const interactiveItems: THREE.Object3D[] = [];

    // A. Luxury Sofa (/models/sofa.obj)
    loadInventoryItem('/models/sofa.obj', 2.1, 0.85, 0.82, sofaMat, 'sofa').then((sofaMesh) => {
      sofaMesh.rotation.y = Math.PI;
      sofaMesh.position.set(-0.3, 0, 0.75);
      furnitureGroup.add(sofaMesh);
      interactiveItems.push(sofaMesh);
    });

    // B. Coffee Table (/models/roundTable.obj)
    loadInventoryItem('/models/roundTable.obj', 0.75, 0.75, 0.42, tableMat, 'coffeeTable').then((tableMesh) => {
      tableMesh.position.set(-0.3, 0, -0.05);
      furnitureGroup.add(tableMesh);
      interactiveItems.push(tableMesh);
    });

    // C. Single Seater Armchair (/models/armchair.obj)
    loadInventoryItem('/models/armchair.obj', 0.8, 0.8, 0.8, armchairMat, 'armchair').then((chairMesh) => {
      chairMesh.rotation.y = -Math.PI * 0.70;
      chairMesh.position.set(1.15, 0, 0.05);
      furnitureGroup.add(chairMesh);
      interactiveItems.push(chairMesh);
    });

    // D. TV Media Console (/models/tvUnit.obj)
    loadInventoryItem('/models/tvUnit.obj', 1.6, 0.45, 0.5, tvUnitMat, 'tvUnit').then((tvMesh) => {
      tvMesh.rotation.y = Math.PI;
      tvMesh.position.set(-0.3, 0, -1.48);
      furnitureGroup.add(tvMesh);
      interactiveItems.push(tvMesh);
    });

    // E. Bookcase Shelf (/models/bookcase.obj)
    loadInventoryItem('/models/bookcase.obj', 0.8, 0.35, 1.75, bookcaseMat, 'bookcase').then((shelfMesh) => {
      shelfMesh.rotation.y = Math.PI / 2;
      shelfMesh.position.set(-2.62, 0, -0.6);
      furnitureGroup.add(shelfMesh);
      interactiveItems.push(shelfMesh);
    });

    // F. Botanical Plant (/models/plant.obj)
    loadInventoryItem('/models/plant.obj', 0.55, 0.55, 1.35, plantMat, 'plant').then((plantMesh) => {
      plantMesh.position.set(-2.2, 0, -1.3);
      furnitureGroup.add(plantMesh);
      interactiveItems.push(plantMesh);
    });

    // G. Plush Woven Floor Rug
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.98 });
    const rugMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.015, 2.3), rugMat);
    rugMesh.position.set(-0.2, 0.008, 0.1);
    rugMesh.receiveShadow = true;
    furnitureGroup.add(rugMesh);

    // ==========================================
    // 10. 60 FPS PROGRESSIVE ANIMATION CYCLE (NO AUTO-SPIN)
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

      // Stage 0: 2D Blueprint Lines (Glowing CAD animation)
      if (stageIdx === 0) {
        blueprintGroup.visible = true;
        const pulse = 0.85 + Math.sin(totalTime * 5) * 0.15;
        bpCyanBold.opacity = pulse;
        bpStampMat.opacity = pulse * 0.95;
      } else {
        // Hide 2D blueprint lines completely in 3D mode
        blueprintGroup.visible = false;
      }

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

      // Selection indicator ring
      if (selectedItemRef.current) {
        selectionRing.position.x = selectedItemRef.current.position.x;
        selectionRing.position.z = selectedItemRef.current.position.z;
        const ringScale = (selectedItemRef.current.userData.targetW || 0.9) * 0.75;
        selectionRing.scale.set(ringScale, ringScale, ringScale);
        selectionRingMat.opacity = 0.85;
      } else {
        selectionRingMat.opacity = 0;
      }

      // Camera view from user's manual adjustments
      const target = cameraTargetRef.current;
      const s = cameraAngleRef.current;

      const camX = target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const camY = target.y + s.radius * Math.cos(s.phi);
      const camZ = target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(target.x, target.y, target.z);

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 11. USER INTERACTION: ITEM DRAG + PAN + ORBIT
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const getPointerPos = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseDown = (e: MouseEvent) => {
      getPointerPos(e);
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(interactiveItems, true);

      if (e.button === 0 && intersects.length > 0 && !e.shiftKey) {
        let topItem: THREE.Object3D | null = intersects[0].object;
        while (topItem && topItem.parent !== furnitureGroup && topItem.parent !== roomRoot) {
          topItem = topItem.parent;
        }

        if (topItem && topItem.userData.isDraggable) {
          dragModeRef.current = 'move_item';
          selectedItemRef.current = topItem;

          const ray = raycaster.ray.clone();
          ray.applyMatrix4(roomRoot.matrixWorld.clone().invert());
          const intersectPt = new THREE.Vector3();
          if (ray.intersectPlane(floorPlane, intersectPt)) {
            dragOffsetRef.current.copy(intersectPt).sub(topItem.position);
          }
          return;
        }
      }

      if (e.button === 2 && intersects.length > 0) {
        let topItem: THREE.Object3D | null = intersects[0].object;
        while (topItem && topItem.parent !== furnitureGroup && topItem.parent !== roomRoot) {
          topItem = topItem.parent;
        }
        if (topItem && topItem.userData.isDraggable) {
          topItem.rotation.y += Math.PI / 4;
          selectedItemRef.current = topItem;
          return;
        }
      }

      if (e.button === 2 || e.button === 1 || e.shiftKey) {
        dragModeRef.current = 'pan';
      } else {
        dragModeRef.current = 'rotate';
        selectedItemRef.current = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      getPointerPos(e);

      if (isDraggingRef.current) {
        const dx = e.clientX - prevMouseRef.current.x;
        const dy = e.clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };

        if (dragModeRef.current === 'move_item' && selectedItemRef.current) {
          raycaster.setFromCamera(mouseNorm, camera);
          const ray = raycaster.ray.clone();
          ray.applyMatrix4(roomRoot.matrixWorld.clone().invert());
          const intersectPt = new THREE.Vector3();
          if (ray.intersectPlane(floorPlane, intersectPt)) {
            const newPos = intersectPt.sub(dragOffsetRef.current);
            const halfW = (selectedItemRef.current.userData.targetW || 0.8) / 2;
            const halfD = (selectedItemRef.current.userData.targetD || 0.8) / 2;
            selectedItemRef.current.position.x = Math.max(-2.6 + halfW, Math.min(2.6 - halfW, newPos.x));
            selectedItemRef.current.position.z = Math.max(-1.55 + halfD, Math.min(1.55 - halfD, newPos.z));
          }
        } else if (dragModeRef.current === 'pan') {
          const target = cameraTargetRef.current;
          const s = cameraAngleRef.current;
          const rightX = Math.cos(s.theta);
          const rightZ = -Math.sin(s.theta);

          target.x -= rightX * dx * 0.006;
          target.z -= rightZ * dx * 0.006;
          target.y += dy * 0.006;

          target.x = Math.max(-2.5, Math.min(2.5, target.x));
          target.y = Math.max(-1.5, Math.min(2.5, target.y));
          target.z = Math.max(-2.5, Math.min(2.5, target.z));
        } else {
          const s = cameraAngleRef.current;
          s.theta -= dx * 0.008;
          s.phi = Math.max(0.35, Math.min(1.4, s.phi - dy * 0.008));
        }
      } else {
        raycaster.setFromCamera(mouseNorm, camera);
        const intersects = raycaster.intersectObjects(interactiveItems, true);
        dom.style.cursor = intersects.length > 0 ? 'move' : 'grab';
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dom.style.cursor = 'grab';
    };

    const handleDblClick = (e: MouseEvent) => {
      getPointerPos(e);
      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(interactiveItems, true);
      if (intersects.length > 0) {
        let topItem: THREE.Object3D | null = intersects[0].object;
        while (topItem && topItem.parent !== furnitureGroup && topItem.parent !== roomRoot) {
          topItem = topItem.parent;
        }
        if (topItem && topItem.userData.isDraggable) {
          topItem.rotation.y += Math.PI / 4;
          selectedItemRef.current = topItem;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && selectedItemRef.current) {
        selectedItemRef.current.rotation.y += e.shiftKey ? -Math.PI / 4 : Math.PI / 4;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = cameraAngleRef.current;
      s.radius = Math.max(9.0, Math.min(16.0, s.radius + e.deltaY * 0.005));
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('dblclick', handleDblClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

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
      dom.removeEventListener('dblclick', handleDblClick);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[660px] flex items-center justify-center select-none overflow-visible touch-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
