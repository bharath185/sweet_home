'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  // Camera spherical coordinates with safe bounds
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.0, radius: 12.0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 640;

    // 1. Three.js Scene Setup (Transparent canvas)
    const scene = new THREE.Scene();

    // Perspective Camera: FOV 30 with radius 12.0 provides a generous view where the whole room fits comfortably
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Warm Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
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

    // Soft Blue Sky Fill Light
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.85);
    fillLight.position.set(-10, 12, -9);
    scene.add(fillLight);

    // 3. Scaled Root Room Group (Scale 0.58 ensures zero cropping during ANY 360 degree drag or tilt)
    const roomRoot = new THREE.Group();
    roomRoot.scale.set(0.58, 0.58, 0.58);
    scene.add(roomRoot);

    // Chandelier Warm Point Light
    const chandelierPoint = new THREE.PointLight(0xfef08a, 0, 10, 1.3);
    chandelierPoint.position.set(0, 2.1, 0);
    chandelierPoint.castShadow = true;
    roomRoot.add(chandelierPoint);

    // Floor Reading Lamp Warm Point Light
    const floorLampPoint = new THREE.PointLight(0xffedd5, 0, 6, 1.6);
    floorLampPoint.position.set(1.7, 1.4, -1.1);
    roomRoot.add(floorLampPoint);

    // TV Backlight Glow
    const tvGlowLight = new THREE.PointLight(0x38bdf8, 0, 4, 1.8);
    tvGlowLight.position.set(-0.95, 1.15, -1.7);
    roomRoot.add(tvGlowLight);

    // ==========================================
    // 4. PHOTOREALISTIC PROCEDURAL MATERIALS
    // ==========================================
    // Realistic Canvas Texture Generator for Floor
    const createWoodTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#6b4e31';
        ctx.fillRect(0, 0, 512, 512);
        // Wood grain planks
        for (let y = 0; y < 512; y += 32) {
          ctx.strokeStyle = '#4a331e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
          // Grain variations
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

    const woodTex = createWoodTexture();
    const woodFloorMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.32,
      metalness: 0.08,
    });

    const drywallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.92,
      metalness: 0.02,
    });

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.05,
    });

    const darkOakMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.45,
      metalness: 0.05,
    });

    const warmOakMat = new THREE.MeshStandardMaterial({
      color: 0x926644,
      roughness: 0.4,
      metalness: 0.05,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88,
    });

    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.15,
      metalness: 0.1,
    });

    const velvetNavyMat = new THREE.MeshStandardMaterial({
      color: 0x1a2e4c,
      roughness: 0.65,
      metalness: 0.12,
    });

    const cognacLeatherMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.48,
      metalness: 0.15,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.6,
    });

    const rugTextureMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.98,
      metalness: 0.02,
    });

    const plantGreenMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.38,
      metalness: 0.05,
    });

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
    // 6. STAGE 1: 3D ARCHITECTURAL WALLS & FLOOR
    // ==========================================
    const wallsGroup = new THREE.Group();
    roomRoot.add(wallsGroup);

    // Solid Hardwood Floor with bevel
    const floorGeom = new THREE.BoxGeometry(4.4, 0.06, 3.8);
    const roomFloor = new THREE.Mesh(floorGeom, woodFloorMat);
    roomFloor.position.set(0, -0.03, 0);
    roomFloor.receiveShadow = true;
    wallsGroup.add(roomFloor);

    // Back Wall
    const backWallGeom = new THREE.BoxGeometry(4.4, 2.4, 0.16);
    const backWall = new THREE.Mesh(backWallGeom, drywallMat);
    backWall.position.set(0, 1.2, -1.9);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    // Left Wall
    const leftWallGeom = new THREE.BoxGeometry(0.16, 2.4, 3.8);
    const leftWall = new THREE.Mesh(leftWallGeom, drywallMat);
    leftWall.position.set(-2.2, 1.2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    // Right Low Cutaway Wall
    const rightWallGeom = new THREE.BoxGeometry(0.16, 0.65, 3.8);
    const rightWall = new THREE.Mesh(rightWallGeom, drywallMat);
    rightWall.position.set(2.2, 0.325, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    // Baseboards along back wall and left wall
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.03), baseboardMat);
    backBaseboard.position.set(0, 0.06, -1.8);
    wallsGroup.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 3.8), baseboardMat);
    leftBaseboard.position.set(-2.1, 0.06, 0);
    wallsGroup.add(leftBaseboard);

    // Architectural Vertical Wood Slat Feature Wall Panel
    const woodSlatGroup = new THREE.Group();
    const slatCount = 18;
    for (let i = 0; i < slatCount; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.3, 0.03), darkOakMat);
      slat.position.set(-1.85 + i * 0.1, 1.15, -1.8);
      slat.castShadow = true;
      woodSlatGroup.add(slat);
    }
    wallsGroup.add(woodSlatGroup);

    // ==========================================
    // 7. STAGE 2: WINDOWS & ENTRANCE DOORS
    // ==========================================
    const architecturalFittingsGroup = new THREE.Group();
    roomRoot.add(architecturalFittingsGroup);

    // Modern Sliding Panoramic Window on Back Wall
    const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
    const winGroup = new THREE.Group();
    // Frame
    const winTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.08), winFrameMat);
    winTop.position.set(0, 0.65, 0);
    const winBottom = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.08), winFrameMat);
    winBottom.position.set(0, -0.65, 0);
    const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.08), winFrameMat);
    winLeft.position.set(-0.8, 0, 0);
    const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.08), winFrameMat);
    winRight.position.set(0.8, 0, 0);
    const winCenter = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.08), winFrameMat);
    // Glass panes
    const pane1 = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.24, 0.02), glassMat);
    pane1.position.set(-0.38, 0, 0);
    const pane2 = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.24, 0.02), glassMat);
    pane2.position.set(0.38, 0, 0);
    winGroup.add(winTop, winBottom, winLeft, winRight, winCenter, pane1, pane2);
    winGroup.position.set(0.95, 1.25, -1.82);
    architecturalFittingsGroup.add(winGroup);

    // Luxury Modern Wood Entrance Door on Left Wall
    const doorGroup = new THREE.Group();
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.1, 0.05), warmOakMat);
    doorLeaf.position.set(0, 1.05, 0);
    doorLeaf.castShadow = true;
    // Brass door handle
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 16), brassMat);
    handleBar.position.set(0.34, 1.05, 0.05);
    doorGroup.add(doorLeaf, handleBar);
    doorGroup.rotation.y = Math.PI / 2;
    doorGroup.position.set(-2.12, 0, 0.6);
    architecturalFittingsGroup.add(doorGroup);

    // Large Arched Vanity Mirror with Brass Frame on Left Wall
    const mirrorGroup = new THREE.Group();
    const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.02), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.05 }));
    const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.59, 1.44, 0.03), brassMat);
    mirrorFrame.position.z = -0.01;
    mirrorGroup.add(mirrorGlass, mirrorFrame);
    mirrorGroup.rotation.y = Math.PI / 2;
    mirrorGroup.position.set(-2.12, 0.8, -0.9);
    architecturalFittingsGroup.add(mirrorGroup);

    // ==========================================
    // 8. STAGE 3: CEILING LIGHTING FIXTURES
    // ==========================================
    const lightingGroup = new THREE.Group();
    roomRoot.add(lightingGroup);

    // Sputnik Brass Orbital Chandelier with 6 Glowing Globes
    const chandelierGroup = new THREE.Group();
    const centerRod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 16), brassMat);
    centerRod.position.y = 0.25;
    const centerBall = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), brassMat);
    chandelierGroup.add(centerRod, centerBall);

    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const armOffsets = [
      [0.25, 0, 0], [-0.25, 0, 0],
      [0, 0.15, 0.22], [0, -0.15, -0.22],
      [-0.18, 0.1, 0.18], [0.18, -0.1, -0.18]
    ];

    armOffsets.forEach(([x, y, z]) => {
      const armGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8);
      const arm = new THREE.Mesh(armGeom, brassMat);
      arm.position.set(x / 2, y / 2, z / 2);
      arm.lookAt(x, y, z);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), globeMat);
      globe.position.set(x, y, z);
      chandelierGroup.add(arm, globe);
    });

    chandelierGroup.position.set(0, 1.9, -0.1);
    lightingGroup.add(chandelierGroup);

    // Floor Arched Brass Reading Lamp
    const floorLampGroup = new THREE.Group();
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32), marbleMat);
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 16), brassMat);
    lampPole.position.set(0, 0.85, 0);
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 24, 1, true), brassMat);
    lampShade.position.set(-0.25, 1.6, 0.2);
    lampShade.rotation.x = Math.PI / 4;
    floorLampGroup.add(lampBase, lampPole, lampShade);
    floorLampGroup.position.set(1.7, 0, -1.2);
    lightingGroup.add(floorLampGroup);

    // ==========================================
    // 9. STAGE 4 & 5: LUXURY FURNITURE SUITE
    // ==========================================
    const furnitureGroup = new THREE.Group();
    roomRoot.add(furnitureGroup);

    // A. Contemporary Luxury 3-Seater Velvet Sofa with Cushions & Throw Pillows
    const sofaGroup = new THREE.Group();
    // Base & Legs
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.9), velvetNavyMat);
    sofaBase.position.set(0, 0.2, 0);
    sofaBase.castShadow = true;
    sofaGroup.add(sofaBase);

    // 4 Brass Tapered Legs
    [[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 0.35]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012, 0.14, 16), brassMat);
      leg.position.set(lx, 0.07, lz);
      sofaGroup.add(leg);
    });

    // Seat Cushions (3 plump cushions)
    for (let c = 0; c < 3; c++) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.72), velvetNavyMat);
      cushion.position.set(-0.64 + c * 0.64, 0.36, 0.05);
      cushion.castShadow = true;
      sofaGroup.add(cushion);
    }

    // Backrest & Back Pillows
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 0.18), velvetNavyMat);
    backrest.position.set(0, 0.52, 0.38);
    backrest.castShadow = true;
    sofaGroup.add(backrest);

    // Armrests
    const armLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.9), velvetNavyMat);
    armLeft.position.set(-1.02, 0.4, 0);
    const armRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.9), velvetNavyMat);
    armRight.position.set(1.02, 0.4, 0);
    sofaGroup.add(armLeft, armRight);

    // Decorative Accent Throw Pillows (Gold & Emerald)
    const pillowGoldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
    const pillowEmeraldMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.1), pillowGoldMat);
    pillow1.position.set(-0.75, 0.45, 0.26);
    pillow1.rotation.y = 0.25;
    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.1), pillowEmeraldMat);
    pillow2.position.set(0.75, 0.45, 0.26);
    pillow2.rotation.y = -0.25;
    sofaGroup.add(pillow1, pillow2);

    sofaGroup.position.set(-0.15, 0, 0.45);
    furnitureGroup.add(sofaGroup);

    // B. Mid-Century Cognac Leather Wingback Accent Armchair
    const chairGroup = new THREE.Group();
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.68), cognacLeatherMat);
    chairSeat.position.set(0, 0.36, 0);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.14), cognacLeatherMat);
    chairBack.position.set(0, 0.62, 0.28);
    chairBack.rotation.x = -0.15;
    chairGroup.add(chairSeat, chairBack);

    // 4 Splayed Walnut Legs
    [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(([cx, cz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.012, 0.32, 16), darkOakMat);
      leg.position.set(cx, 0.16, cz);
      leg.rotation.z = cx > 0 ? -0.15 : 0.15;
      chairGroup.add(leg);
    });

    chairGroup.rotation.y = -Math.PI / 3.4;
    chairGroup.position.set(1.35, 0, 0.4);
    furnitureGroup.add(chairGroup);

    // C. Dual-Nesting Coffee Tables (Calacatta Marble + Smoked Wood Table)
    const coffeeTableGroup = new THREE.Group();
    // Large Marble Table
    const marbleTop = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 36), marbleMat);
    marbleTop.position.set(0, 0.38, 0);
    marbleTop.castShadow = true;
    const marbleRim = new THREE.Mesh(new THREE.CylinderGeometry(0.445, 0.445, 0.045, 36, 1, true), brassMat);
    marbleRim.position.set(0, 0.38, 0);
    const marbleCol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.36, 24), brassMat);
    marbleCol.position.set(0, 0.18, 0);
    const marbleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32), brassMat);
    marbleBase.position.set(0, 0.01, 0);
    coffeeTableGroup.add(marbleTop, marbleRim, marbleCol, marbleBase);

    // Small Nesting Lower Table
    const nestTop = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 32), darkOakMat);
    nestTop.position.set(0.45, 0.3, 0.2);
    const nestLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.28, 20), brassMat);
    nestLeg.position.set(0.45, 0.14, 0.2);
    coffeeTableGroup.add(nestTop, nestLeg);

    // Ceramic Tabletop Vase with Pampas Grass & Open Art Book
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.16, 20), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 }));
    vase.position.set(-0.05, 0.48, -0.05);
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.24), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
    book.position.set(0.1, 0.41, 0.08);
    book.rotation.y = 0.3;
    coffeeTableGroup.add(vase, book);

    coffeeTableGroup.position.set(-0.05, 0, -0.45);
    furnitureGroup.add(coffeeTableGroup);

    // D. Japanese Minimalist Horizontal Oak TV Media Credenza
    const credenzaGroup = new THREE.Group();
    const credBody = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.38, 0.38), warmOakMat);
    credBody.position.set(0, 0.3, 0);
    credBody.castShadow = true;
    // 4 Brass Hairpin Legs
    [[-0.75, -0.15], [0.75, -0.15], [-0.75, 0.15], [0.75, 0.15]].forEach(([kx, kz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.14, 16), brassMat);
      leg.position.set(kx, 0.07, kz);
      credenzaGroup.add(leg);
    });
    credenzaGroup.add(credBody);
    credenzaGroup.position.set(-0.95, 0, -1.6);
    furnitureGroup.add(credenzaGroup);

    // E. 65" Ultra-Slim Frameless OLED TV Screen with Scenic Art Display
    const tvGroup = new THREE.Group();
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.76, 0.03), new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9 }));
    const tvScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.28, 0.72, 0.032),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.05,
      })
    );
    tvGroup.add(tvFrame, tvScreen);
    tvGroup.position.set(-0.95, 1.15, -1.74);
    furnitureGroup.add(tvGroup);

    // F. Large Architectural Gallery Framed Artwork
    const artGroup = new THREE.Group();
    const artFrame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.04), darkOakMat);
    const artCanvas = new THREE.Mesh(
      new THREE.BoxGeometry(0.77, 1.02, 0.042),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.4,
      })
    );
    artGroup.add(artFrame, artCanvas);
    artGroup.position.set(1.05, 1.35, -1.78);
    furnitureGroup.add(artGroup);

    // G. Realistic Tropical Monstera Plant in Fluted Ceramic Pot
    const plantGroup = new THREE.Group();
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.42, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    planter.position.set(0, 0.21, 0);
    planter.castShadow = true;
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0x271810, roughness: 0.9 }));
    soil.position.set(0, 0.41, 0);
    plantGroup.add(planter, soil);

    // Multiple Organic Layered Green Leaves
    const leafAngles = [0, 1.1, 2.2, 3.4, 4.6, 5.7];
    leafAngles.forEach((ang, idx) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.55 + idx * 0.08, 8), plantGreenMat);
      stem.position.set(Math.cos(ang) * 0.08, 0.55 + idx * 0.06, Math.sin(ang) * 0.08);
      stem.rotation.z = Math.cos(ang) * 0.35;
      stem.rotation.x = Math.sin(ang) * 0.35;
      const leafBlade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 12), plantGreenMat);
      leafBlade.position.set(Math.cos(ang) * 0.22, 0.8 + idx * 0.08, Math.sin(ang) * 0.22);
      leafBlade.rotation.x = Math.PI / 2 + Math.sin(ang) * 0.4;
      leafBlade.rotation.z = Math.cos(ang) * 0.4;
      plantGroup.add(stem, leafBlade);
    });

    plantGroup.position.set(-1.75, 0, -1.4);
    furnitureGroup.add(plantGroup);

    // H. Plush Textured Geometric Area Rug
    const rugMesh = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.015, 2.4), rugTextureMat);
    rugMesh.position.set(0.1, 0.008, -0.05);
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

      // Stage 0: 2D Blueprint CAD Lines
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

      // Stage 3: Ceiling Lighting & Soft Illumination
      if (stageIdx >= 3) {
        lightingGroup.visible = true;
        const lightProgress = stageIdx === 3 ? stageNorm : 1.0;
        chandelierPoint.intensity = lightProgress * 1.8;
        floorLampPoint.intensity = lightProgress * 1.4;
        tvGlowLight.intensity = lightProgress * 1.5;
      } else {
        lightingGroup.visible = false;
        chandelierPoint.intensity = 0;
        floorLampPoint.intensity = 0;
        tvGlowLight.intensity = 0;
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
      // Clamp phi between 0.45 (~25 deg elevated) and 1.35 (~77 deg low angle) to guarantee zero top/bottom cropping
      s.phi = Math.max(0.45, Math.min(1.35, s.phi - dy * 0.007));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Safe Wheel Zoom (Clamped radius)
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
