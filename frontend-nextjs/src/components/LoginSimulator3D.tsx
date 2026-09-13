'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {
  buildTableMeshGroup,
  buildSofaMeshGroup,
  buildLampMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildInteriorDecorMeshGroup,
  buildShelfMeshGroup
} from '../services/proceduralFurniture';

export const LoginSimulator3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4.2, phi: Math.PI / 3.4, radius: 7.0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 650;
    const height = mount.clientHeight || 580;

    // 1. Three.js Scene Setup (Transparent alpha, No scene background, No fog)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.2, 4.0, 5.2);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
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

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    // Ceiling spot light (activated in lighting stage)
    const ceilingSpot = new THREE.PointLight(0xfef08a, 0, 8);
    ceilingSpot.position.set(0, 2.2, 0);
    ceilingSpot.castShadow = true;
    scene.add(ceilingSpot);

    // 3. Room Hardwood Floor (appears with 3D walls)
    const floorGeom = new THREE.BoxGeometry(4.4, 0.04, 3.6);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x947155,
      roughness: 0.35,
      metalness: 0.1,
    });
    const roomFloor = new THREE.Mesh(floorGeom, floorMat);
    roomFloor.position.set(0, -0.02, 0);
    roomFloor.receiveShadow = true;

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
    wallsGroup.add(roomFloor);
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

    // Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, metalness: 0.1 });
    const coffeeTable = buildTableMeshGroup({ width: 90, depth: 55, height: 42, shape: 'rectangular', legStyle: '4_legs_corner', topThickness: 4, legThickness: 5, bevel: true }, tableMat);
    coffeeTable.position.set(0, 0, -0.6);
    furnitureGroup.add(coffeeTable);

    // Tabletop Plant Decor
    const decorMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, metalness: 0.2 });
    const tableDecor = buildInteriorDecorMeshGroup({ width: 25, depth: 25, height: 25, type: 'potted_plant' }, decorMat);
    tableDecor.position.set(0, 0.42, -0.6);
    furnitureGroup.add(tableDecor);

    // Wall Floating Shelf
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
      totalTime += delta;

      // Loop over 18 seconds (3 seconds per stage: 0=Blueprint, 1=Walls, 2=Fittings, 3=Lighting, 4=Furniture, 5=Full Suite)
      const loopDuration = 18.0;
      const stageIdx = Math.min(5, Math.floor((totalTime % loopDuration) / 3.0));
      const stageTime = (totalTime % 3.0);
      const stageNorm = Math.min(1.0, stageTime / 2.0); // 0 to 1 over first 2s of stage

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

      // Camera Orbit Animation (Smooth automatic slow rotation)
      const s = cameraAngleRef.current;
      if (!isDraggingRef.current) {
        s.theta += delta * 0.14;
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

  return (
    <div className="relative w-full h-[480px] lg:h-[600px] flex items-center justify-center select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
