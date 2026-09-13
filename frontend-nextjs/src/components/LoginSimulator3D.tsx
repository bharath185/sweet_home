'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  buildTableMeshGroup,
  buildChairMeshGroup,
  buildSofaMeshGroup,
  buildCabinetMeshGroup,
  buildLampMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildWallDesignMeshGroup,
  buildInteriorDecorMeshGroup,
  buildShelfMeshGroup
} from '../services/proceduralFurniture';

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  // Camera spherical coordinates (generous radius and angle so nothing ever crops)
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.1, radius: 11.2 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 640;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();

    // Field of view 32 with radius ~11.2 ensures the entire room is comfortably framed
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(7.8, 5.8, 7.8);
    camera.lookAt(0, 0.55, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.9);
    sunLight.position.set(8, 16, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.75);
    fillLight.position.set(-9, 10, -8);
    scene.add(fillLight);

    // 3. Root Room Group (Scaled to 0.72 so entire architectural design fits with zero edge cropping)
    const roomRoot = new THREE.Group();
    roomRoot.scale.set(0.72, 0.72, 0.72);
    scene.add(roomRoot);

    // Warm Interior Chandelier Point Light
    const chandelierPoint = new THREE.PointLight(0xfef08a, 0, 9, 1.4);
    chandelierPoint.position.set(0, 2.1, 0);
    chandelierPoint.castShadow = true;
    roomRoot.add(chandelierPoint);

    // Floor Standing Lamp Accent Light
    const floorLampPoint = new THREE.PointLight(0xffedd5, 0, 5, 1.8);
    floorLampPoint.position.set(1.7, 1.5, -1.2);
    roomRoot.add(floorLampPoint);

    // 4. Room Floor (Walnut Hardwood Floor with soft bevel edge)
    const floorGeom = new THREE.BoxGeometry(4.4, 0.04, 3.8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x6e4e37,
      roughness: 0.35,
      metalness: 0.1,
    });
    const roomFloor = new THREE.Mesh(floorGeom, floorMat);
    roomFloor.position.set(0, -0.02, 0);
    roomFloor.receiveShadow = true;

    // 5. Blueprint 2D CAD Line Segments (Stage 0)
    const blueprintGroup = new THREE.Group();
    roomRoot.add(blueprintGroup);

    const bpLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
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

    // 6. 3D Architectural Walls Group (Stage 1)
    const wallsGroup = new THREE.Group();
    wallsGroup.add(roomFloor);
    roomRoot.add(wallsGroup);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.88,
      metalness: 0.05,
    });

    // Back Wall
    const backWallGeom = new THREE.BoxGeometry(4.4, 2.3, 0.15);
    const backWall = new THREE.Mesh(backWallGeom, wallMat);
    backWall.position.set(0, 1.15, -1.9);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    // Left Wall
    const leftWallGeom = new THREE.BoxGeometry(0.15, 2.3, 3.8);
    const leftWall = new THREE.Mesh(leftWallGeom, wallMat);
    leftWall.position.set(-2.2, 1.15, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    // Right Low Cutaway Wall
    const rightWallGeom = new THREE.BoxGeometry(0.15, 0.65, 3.8);
    const rightWall = new THREE.Mesh(rightWallGeom, wallMat);
    rightWall.position.set(2.2, 0.325, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    // Modern Wood Slat Accent Wall Panel on Back Wall
    const woodSlatMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.5 });
    const woodSlatPanel = buildWallDesignMeshGroup({ type: 'wood_slat', width: 190, depth: 6, height: 230 }, woodSlatMat);
    woodSlatPanel.position.set(-0.95, 0, -1.82);
    wallsGroup.add(woodSlatPanel);

    // 7. Windows & Doors Group (Stage 2)
    const architecturalFittingsGroup = new THREE.Group();
    roomRoot.add(architecturalFittingsGroup);

    // Panoramic Sliding Glass Window on Back Wall
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.1, transparent: true, opacity: 0.65 });
    const windowMesh = buildWindowMeshGroup({ width: 140, depth: 15, height: 120, type: 'modern_sliding' }, winMat);
    windowMesh.position.set(1.05, 1.15, -1.82);
    architecturalFittingsGroup.add(windowMesh);

    // Modern Flush Entrance Door on Left Wall
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
    const doorMesh = buildDoorMeshGroup({ width: 90, depth: 10, height: 210, type: 'modern_flush' }, doorMat);
    doorMesh.rotation.y = Math.PI / 2;
    doorMesh.position.set(-2.12, 0, 0.6);
    architecturalFittingsGroup.add(doorMesh);

    // Large Arched Vanity Mirror on Left Wall
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.05 });
    const archedMirror = buildInteriorDecorMeshGroup({ width: 55, depth: 5, height: 150, type: 'arched_mirror' }, mirrorMat);
    archedMirror.rotation.y = Math.PI / 2;
    archedMirror.position.set(-2.14, 0.2, -0.9);
    architecturalFittingsGroup.add(archedMirror);

    // Framed Abstract Wall Art on Back Wall
    const artMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const wallArt = buildInteriorDecorMeshGroup({ width: 75, depth: 4, height: 55, type: 'wall_art' }, artMat);
    wallArt.position.set(-0.95, 1.45, -1.78);
    architecturalFittingsGroup.add(wallArt);

    // 8. Ceiling Lighting Fixtures Group (Stage 3)
    const lightingGroup = new THREE.Group();
    roomRoot.add(lightingGroup);

    // Modern Multi-Light Designer Chandelier
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
    const chandelier = buildLampMeshGroup({ type: 'chandelier', shadeWidth: 55, shadeHeight: 40, totalHeight: 65 }, lampMat);
    chandelier.position.set(0, 1.85, -0.1);
    lightingGroup.add(chandelier);

    // Floor Arched Reading Lamp in Corner
    const arcLampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const floorArcLamp = buildLampMeshGroup({ type: 'floor_arc', shadeWidth: 32, shadeHeight: 22, totalHeight: 180 }, arcLampMat);
    floorArcLamp.position.set(1.7, 0, -1.2);
    lightingGroup.add(floorArcLamp);

    // 9. Rich Luxury Interior Furniture Suite Group (Stage 4 & 5)
    const furnitureGroup = new THREE.Group();
    roomRoot.add(furnitureGroup);

    // A. Luxury L-Shape Royal Navy Velvet Sectional Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45, metalness: 0.1 });
    const sofa = buildSofaMeshGroup({
      width: 200,
      depth: 95,
      height: 78,
      type: 'l_shape_left',
      cushionStyle: 'plump',
      armStyle: 'track_arm',
      legStyle: 'metal_bracket'
    }, sofaMat);
    sofa.position.set(-0.2, 0, 0.45);
    furnitureGroup.add(sofa);

    // B. Cognac Leather Lounge Armchair
    const chairMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5, metalness: 0.15 });
    const armChair = buildChairMeshGroup({
      width: 70,
      depth: 70,
      height: 76,
      seatHeight: 40,
      seatType: 'cushioned',
      backrestStyle: 'wingback',
      legStyle: 'tapered_wood'
    }, chairMat);
    armChair.rotation.y = -Math.PI / 3.8;
    armChair.position.set(1.3, 0, 0.4);
    furnitureGroup.add(armChair);

    // C. Round Marble & Gold Pedestal Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.3 });
    const coffeeTable = buildTableMeshGroup({
      width: 80,
      depth: 80,
      height: 40,
      shape: 'round',
      legStyle: 'pedestal_column',
      topThickness: 4,
      legThickness: 8,
      bevel: true
    }, tableMat);
    coffeeTable.position.set(-0.05, 0, -0.45);
    furnitureGroup.add(coffeeTable);

    // D. Tabletop Bonsai / Succulent Planter
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    const tablePlant = buildInteriorDecorMeshGroup({ width: 22, depth: 22, height: 20, type: 'potted_plant' }, plantMat);
    tablePlant.position.set(-0.05, 0.4, -0.45);
    furnitureGroup.add(tablePlant);

    // E. Modern Low-Profile Media Credenza / TV Unit
    const tvUnitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
    const tvCabinet = buildCabinetMeshGroup({
      width: 160,
      depth: 38,
      height: 42,
      columns: 3,
      rows: 1,
      doorType: 'drawers',
      hasLegs: true
    }, tvUnitMat);
    tvCabinet.position.set(-0.95, 0, -1.6);
    furnitureGroup.add(tvCabinet);

    // F. Sleek Wall-Mounted 65" OLED TV Screen
    const tvFrameGeom = new THREE.BoxGeometry(1.3, 0.75, 0.04);
    const tvFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const tvScreen = new THREE.Mesh(tvFrameGeom, tvFrameMat);
    tvScreen.position.set(-0.95, 1.15, -1.75);
    tvScreen.castShadow = true;
    furnitureGroup.add(tvScreen);

    // G. Floating Display Wall Shelf with Sculptures
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 });
    const shelf = buildShelfMeshGroup({ width: 90, depth: 20, height: 18, type: 'floating' }, shelfMat);
    shelf.position.set(1.05, 1.7, -1.8);
    furnitureGroup.add(shelf);

    // H. Tall Tropical Fiddle-Leaf Fig Corner Tree in Ceramic Pot
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
    const cornerTree = buildInteriorDecorMeshGroup({ width: 50, depth: 50, height: 130, type: 'potted_plant' }, treeMat);
    cornerTree.position.set(-1.75, 0, -1.45);
    furnitureGroup.add(cornerTree);

    // I. Side Drink Table by Armchair
    const sideTableMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 });
    const sideTable = buildTableMeshGroup({
      width: 40,
      depth: 40,
      height: 48,
      shape: 'round',
      legStyle: '4_legs_corner',
      topThickness: 2,
      legThickness: 3,
      bevel: true
    }, sideTableMat);
    sideTable.position.set(1.7, 0, 0.85);
    furnitureGroup.add(sideTable);

    // J. Large Luxury Geometric Plush Area Rug
    const rugGeom = new THREE.PlaneGeometry(2.8, 2.3);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.96 });
    const rugMesh = new THREE.Mesh(rugGeom, rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(0.1, 0.005, -0.05);
    rugMesh.receiveShadow = true;
    furnitureGroup.add(rugMesh);

    // 10. 60 FPS Progressive Animation Loop
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
        floorLampPoint.intensity = lightProgress * 1.4;
      } else {
        lightingGroup.visible = false;
        chandelierPoint.intensity = 0;
        floorLampPoint.intensity = 0;
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

      // Camera Orbit (Smooth 360 rotation with zero cropping)
      const s = cameraAngleRef.current;
      if (!isDraggingRef.current) {
        s.theta += delta * 0.14;
      }

      const camX = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const camY = s.radius * Math.cos(s.phi);
      const camZ = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0.55, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Drag Orbit
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
      s.phi = Math.max(0.25, Math.min(Math.PI / 2.1, s.phi - dy * 0.007));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

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

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[660px] flex items-center justify-center select-none overflow-visible">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
