import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { RealisticMaterials } from '../utils/realisticMaterials';
import { Sun, Moon, Eye, Camera, Sparkles } from 'lucide-react';

export function Viewport3D({ homeState }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const sunLightRef = useRef(null);
  const [timeOfDay, setTimeOfDay] = useState('noon'); // 'morning', 'noon', 'sunset', 'night'
  const [isPhotoRealistic, setIsPhotoRealistic] = useState(true);
  const [viewMode, setViewMode] = useState('aerial'); // 'aerial', 'walk'

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0c1222');

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 5000);
    camera.position.set(350, 420, 520);

    // 3. Renderer with Photorealistic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Smooth Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(300, 50, 250);
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 20;
    controls.maxDistance = 1500;

    // 5. Realistic Sun & Global Illumination Lights
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x1e293b, 0.7);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLightRef.current = sunLight;
    sunLight.position.set(400, 700, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 2000;
    sunLight.shadow.camera.left = -600;
    sunLight.shadow.camera.right = 600;
    sunLight.shadow.camera.top = 600;
    sunLight.shadow.camera.bottom = -600;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 2.5; // Soft shadow blur
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Ground Grid & Plane
    const groundGeom = new THREE.PlaneGeometry(3000, 3000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#090d16',
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(3000, 60, '#1e293b', '#0f172a');
    grid.position.y = 0;
    scene.add(grid);

    // Group for dynamic home contents
    const homeGroup = new THREE.Group();
    scene.add(homeGroup);

    const objLoader = new OBJLoader();

    // Rebuild Scene Meshes
    const rebuildHomeScene = () => {
      while (homeGroup.children.length > 0) {
        const obj = homeGroup.children[0];
        homeGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
      }

      // 1. Rooms Floors (Realistic Parquet)
      (homeState.rooms || []).forEach(room => {
        if (room.points && room.points.length >= 3) {
          const shape = new THREE.Shape();
          shape.moveTo(room.points[0].x, room.points[0].y);
          for (let i = 1; i < room.points.length; i++) {
            shape.lineTo(room.points[i].x, room.points[i].y);
          }
          const floorGeom = new THREE.ShapeGeometry(shape);
          const floorMat = RealisticMaterials.getFloorMaterial();
          if (room.color) floorMat.color.set(room.color);

          const floorMesh = new THREE.Mesh(floorGeom, floorMat);
          floorMesh.rotation.x = Math.PI / 2;
          floorMesh.position.y = 0.2;
          floorMesh.receiveShadow = true;
          homeGroup.add(floorMesh);
        }
      });

      // 2. Walls (PBR Plaster with Soft Shadows & Baseboards)
      (homeState.walls || []).forEach(wall => {
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const height = wall.height || 250;
        const thickness = wall.thickness || 15;

        // Main Wall Box
        const wallGeom = new THREE.BoxGeometry(length, height, thickness);
        const wallMat = RealisticMaterials.getWallMaterial();
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.set((wall.x1 + wall.x2) / 2, height / 2, (wall.y1 + wall.y2) / 2);
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        homeGroup.add(wallMesh);

        // Realistic Baseboard
        const bbGeom = new THREE.BoxGeometry(length, 10, thickness + 2);
        const bbMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
        const bbMesh = new THREE.Mesh(bbGeom, bbMat);
        bbMesh.position.set((wall.x1 + wall.x2) / 2, 5, (wall.y1 + wall.y2) / 2);
        bbMesh.rotation.y = -angle;
        bbMesh.castShadow = true;
        bbMesh.receiveShadow = true;
        homeGroup.add(bbMesh);
      });

      // 3. Furniture (Load Real Sweet Home 3D OBJ Meshes)
      (homeState.furniture || []).forEach(item => {
        const modelPath = `/models/${item.type}.obj`;
        const elev = item.elevation || 0;
        const color = item.color || '#3b82f6';

        // Load the actual OBJ mesh from the JAR asset bundle
        objLoader.load(
          modelPath,
          (obj) => {
            obj.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = RealisticMaterials.getFurnitureMaterial(color, 0.45, 0.1);
              }
            });

            // Calculate bounding box and scale accurately to item dimensions
            const bbox = new THREE.Box3().setFromObject(obj);
            const size = bbox.getSize(new THREE.Vector3());
            const targetW = item.width || 80;
            const targetH = item.height || 80;
            const targetD = item.depth || 80;

            if (size.x > 0 && size.y > 0 && size.z > 0) {
              obj.scale.set(targetW / size.x, targetH / size.y, targetD / size.z);
            }

            obj.position.set(item.x, elev, item.y);
            obj.rotation.y = -((item.angle || 0) * Math.PI) / 180;
            homeGroup.add(obj);
          },
          undefined,
          // Fallback if OBJ is loading or custom block
          () => {
            const fallbackGeom = new THREE.BoxGeometry(item.width, item.height, item.depth);
            const fallbackMat = RealisticMaterials.getFurnitureMaterial(color);
            const mesh = new THREE.Mesh(fallbackGeom, fallbackMat);
            mesh.position.set(item.x, elev + (item.height / 2), item.y);
            mesh.rotation.y = -((item.angle || 0) * Math.PI) / 180;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            homeGroup.add(mesh);
          }
        );
      });
    };

    rebuildHomeScene();

    // Render Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [homeState]);

  // Lighting & Sun Position updates
  const setSunTime = (time) => {
    setTimeOfDay(time);
    if (!sunLightRef.current || !sceneRef.current) return;
    const sun = sunLightRef.current;

    if (time === 'morning') {
      sun.position.set(600, 250, 400);
      sun.color.set('#fed7aa');
      sun.intensity = 1.4;
      sceneRef.current.background.set('#1e293b');
    } else if (time === 'noon') {
      sun.position.set(300, 800, 300);
      sun.color.set('#ffffff');
      sun.intensity = 1.9;
      sceneRef.current.background.set('#0f172a');
    } else if (time === 'sunset') {
      sun.position.set(-600, 180, 200);
      sun.color.set('#fb923c');
      sun.intensity = 1.6;
      sceneRef.current.background.set('#180e29');
    } else if (time === 'night') {
      sun.position.set(200, 400, 200);
      sun.color.set('#93c5fd');
      sun.intensity = 0.3;
      sceneRef.current.background.set('#020617');
    }
  };

  const switchCameraMode = (mode) => {
    setViewMode(mode);
    if (!controlsRef.current) return;
    if (mode === 'walk') {
      controlsRef.current.target.set(300, 110, 250);
      controlsRef.current.object.position.set(300, 120, 400);
    } else {
      controlsRef.current.target.set(300, 50, 250);
      controlsRef.current.object.position.set(350, 420, 520);
    }
  };

  return (
    <div style={{ flex: 1, height: '100%', position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
      {/* Top Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
        background: 'rgba(18, 18, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        padding: '6px 10px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> PBR Realistic View
        </div>

        <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 4px' }} />

        {/* Camera mode buttons */}
        <button
          onClick={() => switchCameraMode('aerial')}
          style={{
            background: viewMode === 'aerial' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Camera size={13} /> Aerial
        </button>

        <button
          onClick={() => switchCameraMode('walk')}
          style={{
            background: viewMode === 'walk' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Eye size={13} /> Eye-Level
        </button>

        <div style={{ width: '1px', height: '16px', background: '#3f3f46', margin: '0 4px' }} />

        {/* Lighting buttons */}
        <button
          onClick={() => setSunTime('morning')}
          style={{
            background: timeOfDay === 'morning' ? '#d97706' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Morning
        </button>
        <button
          onClick={() => setSunTime('noon')}
          style={{
            background: timeOfDay === 'noon' ? '#3b82f6' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Noon
        </button>
        <button
          onClick={() => setSunTime('sunset')}
          style={{
            background: timeOfDay === 'sunset' ? '#ea580c' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Sunset
        </button>
        <button
          onClick={() => setSunTime('night')}
          style={{
            background: timeOfDay === 'night' ? '#4f46e5' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '3px 6px',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Night
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
