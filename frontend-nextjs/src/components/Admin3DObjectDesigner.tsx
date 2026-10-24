'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Input,
  InputNumber,
  Select,
  Slider,
  Switch,
  Tag,
  Space,
  Divider,
  Tooltip,
  Badge,
  message,
  Modal,
  Alert,
} from 'antd';
import {
  BoxPlotOutlined,
  EyeOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  CameraOutlined,
  RedoOutlined,
  UndoOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  BgColorsOutlined,
  CompassOutlined,
  SunOutlined,
  ColumnWidthOutlined,
  GatewayOutlined,
  ToolOutlined,
  CheckOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { CatalogItem, HomePlan } from '../types/plan';
import { buildProceduralMeshGroup, CustomPrimitive } from '../services/proceduralFurniture';
import { createSafeWebGLRenderer, safelyDisposeRenderer } from '../services/webglHelper';

interface Admin3DObjectDesignerProps {
  catalog: CatalogItem[];
  onAddCustomCatalogItem?: (item: CatalogItem, autoPlaceInScene?: boolean) => Promise<CatalogItem | void>;
  onUpdateCatalogItem?: (item: CatalogItem) => Promise<CatalogItem | void> | void;
  onAddItemToPlan?: (item: CatalogItem) => void;
  plan?: HomePlan;
}

const CM = 0.01;

// Archetype Presets for quick generation
const ARCHETYPES = [
  { id: 'table', name: 'Table / Desk', icon: '🍽️', category: 'Living' },
  { id: 'sofa', name: 'Sofa / Seating', icon: '🛋️', category: 'Living' },
  { id: 'chair', name: 'Chair / Stool', icon: '🪑', category: 'Living' },
  { id: 'cabinet', name: 'Cabinet / Storage', icon: '🗄️', category: 'Living' },
  { id: 'bed', name: 'Bed / Suite', icon: '🛏️', category: 'Bedroom' },
  { id: 'lamp', name: 'Lamp / Lighting', icon: '💡', category: 'Lighting' },
  { id: 'door', name: 'Architectural Door', icon: '🚪', category: 'Doors & Windows' },
  { id: 'window', name: 'Glazed Window', icon: '🪟', category: 'Doors & Windows' },
  { id: 'bath', name: 'Bathtub / Sanitary', icon: '🛁', category: 'Bathroom' },
  { id: 'sink', name: 'Washbasin / Vanity', icon: '🚰', category: 'Bathroom' },
  { id: 'plant', name: 'Indoor Botanical', icon: '🪴', category: 'Decor' },
  { id: 'decor', name: 'Interior Decor / Vase', icon: '🏺', category: 'Decor' },
  { id: 'vehicle', name: 'Vehicle / Car', icon: '🚗', category: 'Outdoor' },
  { id: 'primitives', name: 'Compound 3D Primitives', icon: '🧱', category: 'Living' },
];

// Luxury PBR Material & Finish Presets
const MATERIAL_FINISHES = [
  { name: 'Natural Oak', category: 'Wood', color: '#d4a373', roughness: 0.65, metalness: 0.05 },
  { name: 'Rich Walnut', category: 'Wood', color: '#5c3d2e', roughness: 0.45, metalness: 0.05 },
  { name: 'Cherry Timber', category: 'Wood', color: '#854d0e', roughness: 0.5, metalness: 0.05 },
  { name: 'Dark Ebony', category: 'Wood', color: '#27272a', roughness: 0.4, metalness: 0.05 },
  { name: 'Royal Plywood', category: 'Wood', color: '#b45309', roughness: 0.6, metalness: 0.05 },
  { name: 'Carrara Marble', category: 'Stone', color: '#f8fafc', roughness: 0.15, metalness: 0.05 },
  { name: 'Nero Marquina', category: 'Stone', color: '#1e293b', roughness: 0.15, metalness: 0.08 },
  { name: 'Brushed Brass', category: 'Metal', color: '#d97706', roughness: 0.25, metalness: 0.9 },
  { name: 'Polished Chrome', category: 'Metal', color: '#e2e8f0', roughness: 0.08, metalness: 0.98 },
  { name: 'Matte Black Steel', category: 'Metal', color: '#18181b', roughness: 0.45, metalness: 0.8 },
  { name: 'Cognac Leather', category: 'Fabric', color: '#9a3412', roughness: 0.45, metalness: 0.1 },
  { name: 'Navy Velvet', category: 'Fabric', color: '#1e3a8a', roughness: 0.55, metalness: 0.2 },
  { name: 'Emerald Velvet', category: 'Fabric', color: '#064e3b', roughness: 0.55, metalness: 0.2 },
  { name: 'Smoked Glass', category: 'Glass', color: '#334155', roughness: 0.1, metalness: 0.1, opacity: 0.55 },
  { name: 'Ultra-Clear Glass', category: 'Glass', color: '#e0f2fe', roughness: 0.05, metalness: 0.05, opacity: 0.35 },
];

export const Admin3DObjectDesigner: React.FC<Admin3DObjectDesignerProps> = ({
  catalog,
  onAddCustomCatalogItem,
  onUpdateCatalogItem,
  onAddItemToPlan,
  plan,
}) => {
  // Mode: 'create' for new 3D item, 'redesign' for tweaking existing catalog item
  const [designMode, setDesignMode] = useState<'create' | 'redesign'>('create');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>('');

  // 3D Object Core State
  const [itemName, setItemName] = useState<string>('Custom 3D Object');
  const [category, setCategory] = useState<string>('Living');
  const [archetype, setArchetype] = useState<string>('table');
  const [widthCm, setWidthCm] = useState<number>(120);
  const [depthCm, setDepthCm] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(75);
  const [defaultElevation, setDefaultElevation] = useState<number>(0);
  const [price, setPrice] = useState<number>(12999);
  const [description, setDescription] = useState<string>('Custom designed 3D architectural asset.');

  // Procedural archetype parameters
  const [tableShape, setTableShape] = useState<string>('rectangular');
  const [tableLegStyle, setTableLegStyle] = useState<string>('4_legs_corner');
  const [tableBevel, setTableBevel] = useState<boolean>(true);
  const [tableTopThickness, setTableTopThickness] = useState<number>(3.5);

  const [sofaType, setSofaType] = useState<string>('straight_3_seater');
  const [sofaCushion, setSofaCushion] = useState<string>('plump');
  const [sofaArm, setSofaArm] = useState<string>('track_arm');
  const [sofaLegs, setSofaLegs] = useState<string>('wooden_pegs');

  const [chairSeat, setChairSeat] = useState<string>('cushioned');
  const [chairBack, setChairBack] = useState<string>('solid_panel');
  const [chairLegs, setChairLegs] = useState<string>('straight_4');

  const [cabinetDoor, setCabinetDoor] = useState<string>('solid_doors');
  const [cabinetCols, setCabinetCols] = useState<number>(2);
  const [cabinetRows, setCabinetRows] = useState<number>(3);
  const [cabinetHasCrown, setCabinetHasCrown] = useState<boolean>(true);

  // Multi-part Primitives (for compound shapes)
  const [customPrimitives, setCustomPrimitives] = useState<CustomPrimitive[]>([
    { id: 'p1', shape: 'box', width: 100, height: 10, depth: 60, x: 0, y: 50, z: 0, color: '#d4a373' },
    { id: 'p2', shape: 'cylinder', width: 6, height: 50, depth: 6, x: -42, y: 25, z: -24, color: '#18181b' },
    { id: 'p3', shape: 'cylinder', width: 6, height: 50, depth: 6, x: 42, y: 25, z: -24, color: '#18181b' },
    { id: 'p4', shape: 'cylinder', width: 6, height: 50, depth: 6, x: -42, y: 25, z: 24, color: '#18181b' },
    { id: 'p5', shape: 'cylinder', width: 6, height: 50, depth: 6, x: 42, y: 25, z: 24, color: '#18181b' },
  ]);

  // PBR Material State
  const [baseColor, setBaseColor] = useState<string>('#d4a373');
  const [roughness, setRoughness] = useState<number>(0.55);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [activeFinishName, setActiveFinishName] = useState<string>('Natural Oak');

  // Viewport Settings & State
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'warm' | 'ambient' | 'dramatic'>('studio');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showDimensionsBox, setShowDimensionsBox] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 3D Canvas Refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dimensionBoxRef = useRef<THREE.BoxHelper | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ radius: 3.2, theta: 0.75, phi: 1.1, target: new THREE.Vector3(0, 0.45, 0) });

  // Update camera spherical position
  const updateCamera = useCallback(() => {
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

  // Preset Camera Angles
  const setPresetAngle = (view: 'iso' | 'front' | 'top' | 'side' | 'back') => {
    setIsAutoRotating(false);
    const maxDim = Math.max(widthCm, depthCm, heightCm) * CM;
    orbitRef.current.radius = Math.max(1.8, maxDim * 2.8);
    orbitRef.current.target.set(0, (heightCm * CM) / 2, 0);

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
    updateCamera();
  };

  // Build the 3D procedural model mesh
  const rebuild3DModel = useCallback(() => {
    if (!sceneRef.current) return;

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

    if (dimensionBoxRef.current) {
      sceneRef.current.remove(dimensionBoxRef.current);
      dimensionBoxRef.current.dispose();
      dimensionBoxRef.current = null;
    }

    // Create Main PBR Material
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness,
      metalness,
      wireframe: isWireframe,
      transparent: opacity < 0.99,
      opacity,
      side: THREE.DoubleSide,
    });

    let builtGroup: THREE.Group;

    if (archetype === 'primitives') {
      const pGroup = new THREE.Group();
      for (const p of customPrimitives) {
        let geom: THREE.BufferGeometry;
        const w = Math.max(0.01, p.width * CM);
        const h = Math.max(0.01, p.height * CM);
        const d = Math.max(0.01, p.depth * CM);

        if (p.shape === 'cylinder') {
          geom = new THREE.CylinderGeometry(w / 2, w / 2, h, 24);
        } else if (p.shape === 'sphere') {
          geom = new THREE.SphereGeometry(w / 2, 24, 24);
        } else if (p.shape === 'cone') {
          geom = new THREE.ConeGeometry(w / 2, h, 24);
        } else if (p.shape === 'torus') {
          geom = new THREE.TorusGeometry(w / 2, h / 4, 16, 32);
        } else {
          geom = new THREE.BoxGeometry(w, h, d);
        }

        const partMat = p.color
          ? new THREE.MeshStandardMaterial({
              color: new THREE.Color(p.color),
              roughness,
              metalness,
              wireframe: isWireframe,
            })
          : mainMaterial;

        const mesh = new THREE.Mesh(geom, partMat);
        mesh.position.set(p.x * CM, p.y * CM, p.z * CM);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        pGroup.add(mesh);
      }
      builtGroup = pGroup;
    } else {
      // Gather archetype specific parameters
      let params: any = {};
      if (archetype === 'table') {
        params = {
          shape: tableShape,
          legStyle: tableLegStyle,
          bevel: tableBevel,
          topThickness: tableTopThickness,
          legThickness: 5,
        };
      } else if (archetype === 'sofa') {
        params = {
          type: sofaType,
          cushionStyle: sofaCushion,
          armStyle: sofaArm,
          legStyle: sofaLegs,
        };
      } else if (archetype === 'chair') {
        params = {
          seatType: chairSeat,
          backrestStyle: chairBack,
          legStyle: chairLegs,
          seatHeight: heightCm * 0.55,
        };
      } else if (archetype === 'cabinet') {
        params = {
          columns: cabinetCols,
          rows: cabinetRows,
          doorType: cabinetDoor,
          hasCrown: cabinetHasCrown,
          countertop: true,
          hasLegs: true,
        };
      } else if (archetype === 'lamp') {
        params = {
          type: 'floor_arc',
          shadeWidth: widthCm * 0.4,
          shadeHeight: 25,
          totalHeight: heightCm,
        };
      } else if (archetype === 'bed') {
        params = {
          headboardStyle: 'tufted',
          frameStyle: 'platform',
          hasNightstands: true,
        };
      } else if (archetype === 'door') {
        params = { doorStyle: 'modern_panel' };
      } else if (archetype === 'window') {
        params = { windowStyle: 'casement' };
      } else if (archetype === 'vehicle') {
        params = { type: 'sedan', color: baseColor };
      }

      builtGroup = buildProceduralMeshGroup(archetype, params, widthCm, depthCm, heightCm, mainMaterial);
    }

    modelGroupRef.current = builtGroup;
    sceneRef.current.add(builtGroup);

    // Dimension Bounding Box Overlay
    if (showDimensionsBox && builtGroup) {
      const box = new THREE.BoxHelper(builtGroup, new THREE.Color(0x38bdf8));
      dimensionBoxRef.current = box;
      sceneRef.current.add(box);
    }
  }, [
    archetype,
    widthCm,
    depthCm,
    heightCm,
    baseColor,
    roughness,
    metalness,
    opacity,
    isWireframe,
    showDimensionsBox,
    tableShape,
    tableLegStyle,
    tableBevel,
    tableTopThickness,
    sofaType,
    sofaCushion,
    sofaArm,
    sofaLegs,
    chairSeat,
    chairBack,
    chairLegs,
    cabinetDoor,
    cabinetCols,
    cabinetRows,
    cabinetHasCrown,
    customPrimitives,
  ]);

  // Update Studio Lights based on Lighting Preset
  const updateLights = useCallback(() => {
    if (!sceneRef.current) return;
    if (lightsGroupRef.current) {
      sceneRef.current.remove(lightsGroupRef.current);
    }

    const lights = new THREE.Group();
    if (lightingPreset === 'studio') {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.9);
      lights.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(4, 7, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      lights.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
      fillLight.position.set(-5, 4, -4);
      lights.add(fillLight);
    } else if (lightingPreset === 'warm') {
      const hemi = new THREE.HemisphereLight(0xfef3c7, 0x451a03, 0.8);
      lights.add(hemi);

      const warmKey = new THREE.DirectionalLight(0xf59e0b, 1.4);
      warmKey.position.set(4, 6, 3);
      warmKey.castShadow = true;
      lights.add(warmKey);

      const rimLight = new THREE.DirectionalLight(0xfbbf24, 0.7);
      rimLight.position.set(-4, 3, -4);
      lights.add(rimLight);
    } else if (lightingPreset === 'ambient') {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x64748b, 1.4);
      lights.add(hemi);
      const softDir = new THREE.DirectionalLight(0xffffff, 0.5);
      softDir.position.set(0, 8, 0);
      lights.add(softDir);
    } else if (lightingPreset === 'dramatic') {
      const ambient = new THREE.AmbientLight(0x0284c7, 0.2);
      lights.add(ambient);
      const spot = new THREE.SpotLight(0x38bdf8, 2.5);
      spot.position.set(3, 8, 3);
      spot.castShadow = true;
      lights.add(spot);
    }

    lightsGroupRef.current = lights;
    sceneRef.current.add(lights);
  }, [lightingPreset]);

  // Capture High-Res 3D Snapshot from current angle
  const handleCaptureThumbnail = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    setCapturedThumbnail(dataUrl);
    message.success('📸 3D Thumbnail snapshot captured successfully!');
  };

  // Load Existing Catalog Item for Redesign
  const handleSelectExistingItem = (itemId: string) => {
    const found = catalog.find((i) => i.id === itemId);
    if (!found) return;

    setSelectedCatalogId(found.id);
    setDesignMode('redesign');
    setItemName(found.name);
    setCategory(found.category || 'Living');
    setWidthCm(found.width || 100);
    setDepthCm(found.depth || 60);
    setHeightCm(found.height || 75);
    setDefaultElevation(found.defaultElevation || 0);
    setBaseColor(found.defaultColor || '#d4a373');

    // Parse model string if procedural
    if (found.model && found.model.startsWith('procedural:')) {
      const parts = found.model.split(':');
      const detectedArchetype = parts[1] || 'table';
      setArchetype(detectedArchetype);
      try {
        if (parts[2]) {
          const parsed = JSON.parse(parts.slice(2).join(':'));
          if (parsed.shape) setTableShape(parsed.shape);
          if (parsed.legStyle) setTableLegStyle(parsed.legStyle);
          if (parsed.type) setSofaType(parsed.type);
          if (parsed.cushionStyle) setSofaCushion(parsed.cushionStyle);
          if (parsed.doorType) setCabinetDoor(parsed.doorType);
          if (parsed.seatType) setChairSeat(parsed.seatType);
          if (parsed.primitives && Array.isArray(parsed.primitives)) {
            setCustomPrimitives(parsed.primitives);
          }
        }
      } catch (e) {
        console.warn('Could not parse procedural json:', e);
      }
    }

    message.info(`Loaded "${found.name}" into 3D Object Design Studio for redesign`);
  };

  // Save as New 3D Catalog Item
  const handleSaveAsNew = async () => {
    if (!itemName.trim()) {
      message.error('Please enter a name for the 3D item');
      return;
    }

    setIsSaving(true);
    const newId = `item_${Date.now()}`;

    // Construct model procedural definition
    let modelString = '';
    if (archetype === 'primitives') {
      modelString = `procedural:primitives:${JSON.stringify({ primitives: customPrimitives })}`;
    } else {
      let params: any = {};
      if (archetype === 'table') params = { shape: tableShape, legStyle: tableLegStyle, bevel: tableBevel, topThickness: tableTopThickness };
      if (archetype === 'sofa') params = { type: sofaType, cushionStyle: sofaCushion, armStyle: sofaArm, legStyle: sofaLegs };
      if (archetype === 'chair') params = { seatType: chairSeat, backrestStyle: chairBack, legStyle: chairLegs };
      if (archetype === 'cabinet') params = { columns: cabinetCols, rows: cabinetRows, doorType: cabinetDoor, hasCrown: cabinetHasCrown };
      modelString = `procedural:${archetype}:${JSON.stringify(params)}`;
    }

    const newItem: CatalogItem = {
      id: newId,
      name: itemName.trim(),
      category: category as any,
      width: widthCm,
      depth: depthCm,
      height: heightCm,
      defaultElevation,
      defaultColor: baseColor,
      model: modelString,
      icon: capturedThumbnail || '/models/box.png',
      isCustom: true,
      description,
      roughness,
      metalness,
      opacity,
      price,
    };

    try {
      if (onAddCustomCatalogItem) {
        await onAddCustomCatalogItem(newItem, false);
      } else {
        // Direct save via backend
        await fetch('/api/catalog/furniture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      }
      message.success(`✨ "${newItem.name}" saved to 3D Catalog & Cloud Database!`);
    } catch (e: any) {
      message.error(`Save notice: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing item
  const handleUpdateExisting = async () => {
    if (!selectedCatalogId) {
      message.warning('Please select an existing catalog item to update');
      return;
    }

    setIsSaving(true);
    let modelString = '';
    if (archetype === 'primitives') {
      modelString = `procedural:primitives:${JSON.stringify({ primitives: customPrimitives })}`;
    } else {
      let params: any = {};
      if (archetype === 'table') params = { shape: tableShape, legStyle: tableLegStyle, bevel: tableBevel, topThickness: tableTopThickness };
      if (archetype === 'sofa') params = { type: sofaType, cushionStyle: sofaCushion, armStyle: sofaArm, legStyle: sofaLegs };
      if (archetype === 'chair') params = { seatType: chairSeat, backrestStyle: chairBack, legStyle: chairLegs };
      if (archetype === 'cabinet') params = { columns: cabinetCols, rows: cabinetRows, doorType: cabinetDoor, hasCrown: cabinetHasCrown };
      modelString = `procedural:${archetype}:${JSON.stringify(params)}`;
    }

    const updatedItem: CatalogItem = {
      id: selectedCatalogId,
      name: itemName.trim(),
      category: category as any,
      width: widthCm,
      depth: depthCm,
      height: heightCm,
      defaultElevation,
      defaultColor: baseColor,
      model: modelString,
      icon: capturedThumbnail || '/models/box.png',
      isCustom: true,
      description,
      roughness,
      metalness,
      opacity,
      price,
    };

    try {
      if (onUpdateCatalogItem) {
        await onUpdateCatalogItem(updatedItem);
      } else {
        await fetch('/api/catalog/furniture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });
      }
      message.success(`✓ "${updatedItem.name}" updated successfully in 3D Catalog!`);
    } catch (e: any) {
      message.error(`Update notice: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add sub-primitive component
  const handleAddPrimitivePart = () => {
    const newPart: CustomPrimitive = {
      id: `part_${Date.now()}`,
      shape: 'box',
      width: 40,
      height: 40,
      depth: 40,
      x: 0,
      y: 20,
      z: 0,
      color: baseColor,
    };
    setCustomPrimitives((prev) => [...prev, newPart]);
    setArchetype('primitives');
    message.success('Added new 3D primitive part to composition');
  };

  // Remove primitive part
  const handleRemovePrimitivePart = (partId: string) => {
    setCustomPrimitives((prev) => prev.filter((p) => p.id !== partId));
  };

  // Setup Three.js WebGL scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080f1e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCamera();

    const renderer = createSafeWebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Studio Circular Pedestal / Reflection Disc
    const pedestalGeom = new THREE.CylinderGeometry(2.2, 2.3, 0.04, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.02;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Studio Grid Overlay
    const grid = new THREE.GridHelper(5, 25, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.001;
    scene.add(grid);

    updateLights();
    rebuild3DModel();

    // Mouse Interaction Handlers for Orbiting
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isPanningRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        setIsAutoRotating(false);
        orbitRef.current.theta += dx * 0.008;
        orbitRef.current.phi -= dy * 0.008;
        updateCamera();
      } else if (isPanningRef.current) {
        setIsAutoRotating(false);
        orbitRef.current.target.y += dy * 0.003;
        updateCamera();
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(0.6, Math.min(10, orbitRef.current.radius + e.deltaY * 0.003));
      updateCamera();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    // Render loop
    const animate = () => {
      if (isAutoRotating) {
        orbitRef.current.theta += 0.006 * rotationSpeed;
        updateCamera();
      }

      if (dimensionBoxRef.current && modelGroupRef.current) {
        dimensionBoxRef.current.update();
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);

      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current) safelyDisposeRenderer(rendererRef.current, mountRef.current);
    };
  }, []);

  // Sync lighting changes
  useEffect(() => {
    updateLights();
  }, [lightingPreset, updateLights]);

  // Sync model geometry & materials
  useEffect(() => {
    rebuild3DModel();
  }, [rebuild3DModel]);

  // Filter catalog items for redesign picker
  const filteredCatalog = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchCatalogQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0b1120] text-slate-100 overflow-hidden select-none">
      {/* 1. STUDIO HEADER */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <BoxPlotOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide m-0">3D Object Design Studio</h2>
              <Tag color="purple" style={{ fontSize: 10, margin: 0, fontWeight: 700 }}>
                ADMIN EXCLUSIVE
              </Tag>
              <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                CAD PROCEDURAL ENGINE
              </Tag>
            </div>
            <p className="text-[11px] text-slate-400 m-0">
              Create brand new 3D architectural items or redesign existing catalog assets with real-time PBR shading
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
            <Button
              type={designMode === 'create' ? 'primary' : 'text'}
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setDesignMode('create');
                setItemName('New Custom 3D Asset');
                setSelectedCatalogId('');
                setCapturedThumbnail(null);
              }}
              style={{ fontSize: 11, fontWeight: designMode === 'create' ? 700 : 500 }}
            >
              Create New 3D Object
            </Button>
            <Button
              type={designMode === 'redesign' ? 'primary' : 'text'}
              size="small"
              icon={<EditOutlined />}
              onClick={() => setDesignMode('redesign')}
              style={{ fontSize: 11, fontWeight: designMode === 'redesign' ? 700 : 500 }}
            >
              Redesign Existing Object
            </Button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (Left Presets | Center 3D Viewport | Right Properties Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Archetypes & Catalog Picker */}
        <div className="w-72 border-r border-slate-800/80 bg-[#080f1e]/90 flex flex-col shrink-0 overflow-y-auto">
          {designMode === 'redesign' ? (
            /* Redesign Catalog Browser */
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Pick Catalog Item to Redesign
                </span>
                <Badge count={filteredCatalog.length} overflowCount={999} style={{ backgroundColor: '#0284c7' }} />
              </div>

              <Input
                placeholder="Search catalog items..."
                prefix={<SearchOutlined className="text-slate-500" />}
                value={searchCatalogQuery}
                onChange={(e) => setSearchCatalogQuery(e.target.value)}
                size="small"
                allowClear
                className="bg-[#0f172a] border-slate-700 text-xs rounded-lg"
              />

              <div className="space-y-1.5 mt-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {filteredCatalog.map((item) => {
                  const isSelected = selectedCatalogId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectExistingItem(item.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400/80 text-white shadow-md'
                          : 'bg-[#0f172a]/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-[#0f172a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{item.icon?.startsWith('data:') ? '📸' : '🛋️'}</span>
                        <div className="truncate">
                          <span className="font-semibold block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {item.width} × {item.depth} × {item.height} cm • {item.category}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckOutlined className="text-sky-400 shrink-0 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Create New Archetype Templates */
            <div className="p-3 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                  1. Select 3D Archetype Base
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ARCHETYPES.map((arch) => {
                    const isSelected = archetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => {
                          setArchetype(arch.id);
                          setCategory(arch.category);
                          setItemName(`New Custom ${arch.name.split('/')[0].trim()}`);
                          if (arch.id === 'table') {
                            setWidthCm(120);
                            setDepthCm(70);
                            setHeightCm(75);
                          } else if (arch.id === 'sofa') {
                            setWidthCm(200);
                            setDepthCm(90);
                            setHeightCm(85);
                          } else if (arch.id === 'chair') {
                            setWidthCm(50);
                            setDepthCm(52);
                            setHeightCm(90);
                          } else if (arch.id === 'cabinet') {
                            setWidthCm(120);
                            setDepthCm(45);
                            setHeightCm(180);
                          } else if (arch.id === 'bed') {
                            setWidthCm(180);
                            setDepthCm(210);
                            setHeightCm(110);
                          } else if (arch.id === 'door') {
                            setWidthCm(90);
                            setDepthCm(12);
                            setHeightCm(210);
                          } else if (arch.id === 'window') {
                            setWidthCm(120);
                            setDepthCm(15);
                            setHeightCm(140);
                            setDefaultElevation(90);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-md'
                            : 'bg-[#0f172a]/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-lg">{arch.icon}</span>
                        <div className="truncate text-[11px]">{arch.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Divider style={{ borderColor: '#1e293b', margin: '8px 0' }} />

              {/* Compound Primitives Action */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                    Compound Part Elements
                  </span>
                  <Button
                    size="small"
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddPrimitivePart}
                    style={{ fontSize: 10 }}
                  >
                    Add Part
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {customPrimitives.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || baseColor }} />
                        <span className="text-[11px] font-semibold text-slate-200">
                          Part #{idx + 1}: {p.shape.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.width}×{p.height}×{p.depth}
                        </span>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemovePrimitivePart(p.id)}
                          style={{ padding: '0 4px', height: 20 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER PANEL: INTERACTIVE 3D WEBGL VIEWPORT */}
        <div className="flex-1 relative flex flex-col bg-[#050914] overflow-hidden">
          {/* Floating 3D Tools Overlay Header */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            {/* View Preset Buttons */}
            <div className="flex items-center gap-1 bg-[#0f172a]/90 backdrop-blur border border-slate-800 p-1 rounded-xl shadow-xl pointer-events-auto">
              <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Angle:</span>
              <Button size="small" type="text" onClick={() => setPresetAngle('iso')} style={{ fontSize: 11 }}>
                📐 Iso
              </Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('front')} style={{ fontSize: 11 }}>
                👁️ Front
              </Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('top')} style={{ fontSize: 11 }}>
                🔝 Top
              </Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('side')} style={{ fontSize: 11 }}>
                ➡️ Side
              </Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('back')} style={{ fontSize: 11 }}>
                🔙 Back
              </Button>
            </div>

            {/* Viewport Modes & Lighting */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Lighting Picker */}
              <Select
                value={lightingPreset}
                onChange={(v) => setLightingPreset(v)}
                size="small"
                style={{ width: 130 }}
                options={[
                  { value: 'studio', label: '☀️ Studio Softbox' },
                  { value: 'warm', label: '🌅 Warm Luxury' },
                  { value: 'ambient', label: '💡 Soft Ambient' },
                  { value: 'dramatic', label: '🌑 Dramatic Dark' },
                ]}
              />

              {/* Wireframe toggle */}
              <Tooltip title="Toggle Polygon Wireframe Mode">
                <Button
                  size="small"
                  type={isWireframe ? 'primary' : 'default'}
                  icon={<ToolOutlined />}
                  onClick={() => setIsWireframe(!isWireframe)}
                  style={{ fontSize: 11 }}
                >
                  Wireframe
                </Button>
              </Tooltip>

              {/* Dimensions Box toggle */}
              <Tooltip title="Show Bounding Dimensions Outline">
                <Button
                  size="small"
                  type={showDimensionsBox ? 'primary' : 'default'}
                  icon={<ColumnWidthOutlined />}
                  onClick={() => setShowDimensionsBox(!showDimensionsBox)}
                  style={{ fontSize: 11 }}
                >
                  Dimensions Box
                </Button>
              </Tooltip>

              {/* Auto Rotate toggle */}
              <Button
                size="small"
                type={isAutoRotating ? 'primary' : 'default'}
                icon={<RedoOutlined spin={isAutoRotating} />}
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                style={{ fontSize: 11 }}
              >
                {isAutoRotating ? 'Pause Turntable' : 'Rotate 360°'}
              </Button>

              {/* High-res Snapshot capture */}
              <Tooltip title="Take High-Resolution 3D Snapshot for Catalog Icon">
                <Button
                  size="small"
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={handleCaptureThumbnail}
                  style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontSize: 11, fontWeight: 700 }}
                >
                  Capture 3D Thumbnail
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* 3D Canvas Mount Point */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Dimension Metric Pill Bottom Overlay */}
          <div className="absolute bottom-3 left-3 z-10 bg-[#0f172a]/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Width (X): </span>
              <strong className="text-sky-400 font-bold">{widthCm} cm</strong>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div>
              <span className="text-slate-400">Depth (Z): </span>
              <strong className="text-emerald-400 font-bold">{depthCm} cm</strong>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div>
              <span className="text-slate-400">Height (Y): </span>
              <strong className="text-amber-400 font-bold">{heightCm} cm</strong>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div>
              <span className="text-slate-400">Elevation: </span>
              <strong className="text-purple-400 font-bold">{defaultElevation} cm</strong>
            </div>
          </div>

          {/* Captured Thumbnail Preview Floating Pill */}
          {capturedThumbnail && (
            <div className="absolute bottom-3 right-3 z-10 bg-[#0f172a]/95 backdrop-blur border border-sky-500/50 p-2 rounded-xl shadow-xl flex items-center gap-3">
              <img
                src={capturedThumbnail}
                alt="Captured 3D Icon"
                className="w-12 h-12 rounded-lg object-contain bg-slate-950 border border-slate-700"
              />
              <div>
                <span className="text-[10px] text-sky-400 font-bold uppercase block">Thumbnail Ready</span>
                <span className="text-[11px] text-slate-300">Will be saved as item icon</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INSPECTOR & PARAMETER STUDIO */}
        <div className="w-84 border-l border-slate-800/80 bg-[#0f172a]/95 flex flex-col shrink-0 overflow-y-auto">
          <Tabs
            defaultActiveKey="geometry"
            tabBarStyle={{ margin: 0, padding: '0 16px', borderBottom: '1px solid #1e293b' }}
            items={[
              {
                key: 'geometry',
                label: (
                  <Space orientation="horizontal" size={4}>
                    <SlidersOutlined />
                    <span>Geometry & Shape</span>
                  </Space>
                ),
                children: (
                  <div className="p-4 space-y-4">
                    {/* Dimensions & Scale */}
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                        Dimensions & Proportions (cm)
                      </span>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Width (X axis)</span>
                            <span className="font-mono text-sky-400">{widthCm} cm</span>
                          </div>
                          <Slider
                            min={10}
                            max={600}
                            value={widthCm}
                            onChange={(v) => setWidthCm(v)}
                            trackStyle={{ backgroundColor: '#38bdf8' }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Depth (Z axis)</span>
                            <span className="font-mono text-emerald-400">{depthCm} cm</span>
                          </div>
                          <Slider
                            min={10}
                            max={600}
                            value={depthCm}
                            onChange={(v) => setDepthCm(v)}
                            trackStyle={{ backgroundColor: '#10b981' }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Height (Y axis)</span>
                            <span className="font-mono text-amber-400">{heightCm} cm</span>
                          </div>
                          <Slider
                            min={5}
                            max={400}
                            value={heightCm}
                            onChange={(v) => setHeightCm(v)}
                            trackStyle={{ backgroundColor: '#f59e0b' }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Default Elevation off Floor</span>
                            <span className="font-mono text-purple-400">{defaultElevation} cm</span>
                          </div>
                          <Slider
                            min={0}
                            max={250}
                            value={defaultElevation}
                            onChange={(v) => setDefaultElevation(v)}
                            trackStyle={{ backgroundColor: '#a855f7' }}
                          />
                        </div>
                      </div>
                    </div>

                    <Divider style={{ borderColor: '#1e293b', margin: '8px 0' }} />

                    {/* Archetype-Specific Geometry Controls */}
                    {archetype === 'table' && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                          Table Shape & Leg Options
                        </span>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Tabletop Shape</label>
                          <Select
                            value={tableShape}
                            onChange={(v) => setTableShape(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'rectangular', label: 'Rectangular' },
                              { value: 'round', label: 'Round / Circular' },
                              { value: 'oval', label: 'Oval / Ergonomic' },
                              { value: 'hexagonal', label: 'Hexagonal / Geometric' },
                            ]}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Base & Leg Architecture</label>
                          <Select
                            value={tableLegStyle}
                            onChange={(v) => setTableLegStyle(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: '4_legs_corner', label: '4 Corner Tapered Legs' },
                              { value: 'trestle_base', label: 'Architectural Trestle Base' },
                              { value: 'pedestal_column', label: 'Center Pedestal Column' },
                              { value: 'hairpin_metal', label: 'Modern Hairpin Metal Legs' },
                              { value: 'cross_x_legs', label: 'Cross-X Timber Legs' },
                            ]}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300">Soft Beveled Edges</span>
                          <Switch checked={tableBevel} onChange={(c) => setTableBevel(c)} size="small" />
                        </div>
                      </div>
                    )}

                    {archetype === 'sofa' && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                          Sofa Configuration
                        </span>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Seater Configuration</label>
                          <Select
                            value={sofaType}
                            onChange={(v) => setSofaType(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'straight_2_seater', label: 'Loveseat (2-Seater)' },
                              { value: 'straight_3_seater', label: 'Grand Living (3-Seater)' },
                              { value: 'l_shape_left', label: 'L-Sectional (Left Chaise)' },
                              { value: 'l_shape_right', label: 'L-Sectional (Right Chaise)' },
                            ]}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Cushion Style</label>
                          <Select
                            value={sofaCushion}
                            onChange={(v) => setSofaCushion(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'plump', label: 'Plump Deep Luxury' },
                              { value: 'tufted', label: 'Chesterfield Tufted' },
                              { value: 'minimal', label: 'Minimalist Sleek' },
                            ]}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Armrest Design</label>
                          <Select
                            value={sofaArm}
                            onChange={(v) => setSofaArm(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'track_arm', label: 'Modern Track Arm' },
                              { value: 'rolled_arm', label: 'Classic Rolled Arm' },
                              { value: 'armless', label: 'Armless Modular' },
                            ]}
                          />
                        </div>
                      </div>
                    )}

                    {archetype === 'chair' && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                          Chair Construction
                        </span>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Seat Type</label>
                          <Select
                            value={chairSeat}
                            onChange={(v) => setChairSeat(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'cushioned', label: 'Deep Upholstered Cushion' },
                              { value: 'wood_plank', label: 'Solid Hardwood Plank' },
                              { value: 'curved_shell', label: 'Molded Ergonomic Shell' },
                            ]}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Backrest Architecture</label>
                          <Select
                            value={chairBack}
                            onChange={(v) => setChairBack(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'solid_panel', label: 'Solid Curved Panel' },
                              { value: 'spindle_slats', label: 'Windsor Spindle Slats' },
                              { value: 'wingback', label: 'Executive Wingback' },
                              { value: 'backless', label: 'Backless Stool' },
                            ]}
                          />
                        </div>
                      </div>
                    )}

                    {archetype === 'cabinet' && (
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                          Cabinet & Storage Layout
                        </span>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Front Door Styling</label>
                          <Select
                            value={cabinetDoor}
                            onChange={(v) => setCabinetDoor(v)}
                            className="w-full"
                            size="small"
                            options={[
                              { value: 'solid_doors', label: 'Solid Wood Shaker Doors' },
                              { value: 'glass_doors', label: 'Framed Glass Display' },
                              { value: 'open_shelf', label: 'Open Architectural Shelving' },
                              { value: 'drawers', label: 'Deep Multi-Drawer Stack' },
                              { value: 'arched_panel', label: 'Arched Mediterranean Panel' },
                            ]}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Columns</label>
                            <InputNumber min={1} max={6} value={cabinetCols} onChange={(v) => setCabinetCols(v || 2)} className="w-full" size="small" />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Rows</label>
                            <InputNumber min={1} max={8} value={cabinetRows} onChange={(v) => setCabinetRows(v || 3)} className="w-full" size="small" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300">Crown Molding Header</span>
                          <Switch checked={cabinetHasCrown} onChange={(c) => setCabinetHasCrown(c)} size="small" />
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'materials',
                label: (
                  <Space orientation="horizontal" size={4}>
                    <BgColorsOutlined />
                    <span>Materials & PBR</span>
                  </Space>
                ),
                children: (
                  <div className="p-4 space-y-4">
                    {/* Material Presets Grid */}
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                        Curated Luxury Finishes
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {MATERIAL_FINISHES.map((fin) => {
                          const isSelected = activeFinishName === fin.name;
                          return (
                            <button
                              key={fin.name}
                              type="button"
                              onClick={() => {
                                setActiveFinishName(fin.name);
                                setBaseColor(fin.color);
                                setRoughness(fin.roughness);
                                setMetalness(fin.metalness);
                                setOpacity(fin.opacity || 1.0);
                              }}
                              className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                                  : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="w-full h-4 rounded mb-1 border border-white/10" style={{ backgroundColor: fin.color }} />
                              <div className="text-[10px] truncate leading-tight">{fin.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Divider style={{ borderColor: '#1e293b', margin: '8px 0' }} />

                    {/* Fine PBR Sliders */}
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                        PBR Shader Parameters
                      </span>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Base Color (Hex)</span>
                            <span className="font-mono text-white">{baseColor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={baseColor}
                              onChange={(e) => {
                                setBaseColor(e.target.value);
                                setActiveFinishName('Custom');
                              }}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                            />
                            <Input
                              value={baseColor}
                              onChange={(e) => {
                                setBaseColor(e.target.value);
                                setActiveFinishName('Custom');
                              }}
                              size="small"
                              className="font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Surface Roughness</span>
                            <span className="font-mono text-sky-400">{roughness.toFixed(2)}</span>
                          </div>
                          <Slider
                            min={0.02}
                            max={1.0}
                            step={0.01}
                            value={roughness}
                            onChange={(v) => {
                              setRoughness(v);
                              setActiveFinishName('Custom');
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Metalness / Reflectivity</span>
                            <span className="font-mono text-amber-400">{metalness.toFixed(2)}</span>
                          </div>
                          <Slider
                            min={0.0}
                            max={1.0}
                            step={0.01}
                            value={metalness}
                            onChange={(v) => {
                              setMetalness(v);
                              setActiveFinishName('Custom');
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Opacity / Glass Transparency</span>
                            <span className="font-mono text-emerald-400">{opacity.toFixed(2)}</span>
                          </div>
                          <Slider
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={opacity}
                            onChange={(v) => {
                              setOpacity(v);
                              setActiveFinishName('Custom');
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'metadata',
                label: (
                  <Space orientation="horizontal" size={4}>
                    <AppstoreOutlined />
                    <span>Catalog Info</span>
                  </Space>
                ),
                children: (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Item Name</label>
                      <Input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. Modern Oak Dining Table"
                        className="bg-[#0f172a] border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Catalog Category</label>
                      <Select
                        value={category}
                        onChange={(v) => setCategory(v)}
                        className="w-full"
                        options={[
                          { value: 'Living', label: 'Living Room' },
                          { value: 'Bedroom', label: 'Bedroom' },
                          { value: 'Kitchen', label: 'Kitchen & Dining' },
                          { value: 'Bathroom', label: 'Bathroom & Sanitary' },
                          { value: 'Office', label: 'Office & Study' },
                          { value: 'Lighting', label: 'Lighting' },
                          { value: 'Doors & Windows', label: 'Doors & Windows' },
                          { value: 'Outdoor', label: 'Outdoor & Garden' },
                          { value: 'Decor', label: 'Interior Decor' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Estimated Retail Price (₹)</label>
                      <InputNumber
                        value={price}
                        onChange={(v) => setPrice(v || 0)}
                        prefix="₹"
                        className="w-full"
                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Architectural Specifications</label>
                      <Input.TextArea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Dimensions, finish details, and designer notes"
                        className="bg-[#0f172a] border-slate-700 text-xs"
                      />
                    </div>

                    {capturedThumbnail ? (
                      <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/60 flex items-center gap-3">
                        <img src={capturedThumbnail} alt="Icon" className="w-10 h-10 rounded-lg object-contain bg-slate-900 border border-slate-700" />
                        <div>
                          <span className="text-xs font-bold text-sky-300 block">Custom 3D Icon Captured</span>
                          <span className="text-[10px] text-slate-400">Ready to publish</span>
                        </div>
                      </div>
                    ) : (
                      <Alert
                        type="info"
                        showIcon
                        message="Click 'Capture 3D Thumbnail' on the viewport before publishing to generate a realistic catalog snapshot."
                        style={{ fontSize: 11 }}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />

          {/* PUBLICATION ACTION DRAWER (STICKY AT BOTTOM) */}
          <div className="p-3 border-t border-slate-800 bg-[#080f1e] space-y-2 mt-auto">
            {designMode === 'redesign' && selectedCatalogId ? (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isSaving}
                onClick={handleUpdateExisting}
                block
                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b', fontWeight: 700, height: 36 }}
              >
                Update Existing Catalog Item
              </Button>
            ) : null}

            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={isSaving}
              onClick={handleSaveAsNew}
              block
              style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700, height: 36 }}
            >
              Save as New 3D Catalog Item
            </Button>

            {onAddItemToPlan && (
              <Button
                type="default"
                icon={<AppstoreOutlined />}
                onClick={() => {
                  let modelString = '';
                  if (archetype === 'primitives') {
                    modelString = `procedural:primitives:${JSON.stringify({ primitives: customPrimitives })}`;
                  } else {
                    let params: any = {};
                    if (archetype === 'table') params = { shape: tableShape, legStyle: tableLegStyle, bevel: tableBevel, topThickness: tableTopThickness };
                    if (archetype === 'sofa') params = { type: sofaType, cushionStyle: sofaCushion, armStyle: sofaArm, legStyle: sofaLegs };
                    if (archetype === 'chair') params = { seatType: chairSeat, backrestStyle: chairBack, legStyle: chairLegs };
                    if (archetype === 'cabinet') params = { columns: cabinetCols, rows: cabinetRows, doorType: cabinetDoor, hasCrown: cabinetHasCrown };
                    modelString = `procedural:${archetype}:${JSON.stringify(params)}`;
                  }
                  const tempItem: CatalogItem = {
                    id: `temp_${Date.now()}`,
                    name: itemName,
                    category: category as any,
                    width: widthCm,
                    depth: depthCm,
                    height: heightCm,
                    defaultElevation,
                    defaultColor: baseColor,
                    model: modelString,
                    icon: capturedThumbnail || '/models/box.png',
                  };
                  onAddItemToPlan(tempItem);
                  message.success(`Added "${itemName}" directly into active project floor plan!`);
                }}
                block
                style={{ fontSize: 11 }}
              >
                Add Directly to Active Project Scene
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
