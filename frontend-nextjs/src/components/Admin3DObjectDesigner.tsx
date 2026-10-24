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
  Collapse,
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
  FileAddOutlined,
  ImportOutlined,
  BulbOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { CatalogItem, HomePlan } from '../types/plan';
import { buildProceduralMeshGroup, buildCustomPrimitivesMeshGroup, CustomPrimitive } from '../services/proceduralFurniture';
import { createSafeWebGLRenderer, safelyDisposeRenderer } from '../services/webglHelper';
import { registerCustomObjGeometry, loadObjGeometry } from '../services/objParser';

interface Admin3DObjectDesignerProps {
  catalog: CatalogItem[];
  onAddCustomCatalogItem?: (item: CatalogItem, autoPlaceInScene?: boolean) => Promise<CatalogItem | void>;
  onUpdateCatalogItem?: (item: CatalogItem) => Promise<CatalogItem | void> | void;
  onAddItemToPlan?: (item: CatalogItem) => void;
  plan?: HomePlan;
}

const CM = 0.01;

// 1. Archetype Presets for quick procedural generation
const ARCHETYPES = [
  { id: 'primitives', name: 'Multi-Part 3D Primitives', icon: '🧱', category: 'Living' },
  { id: 'table', name: 'Table / Desk', icon: '🍽️', category: 'Living' },
  { id: 'sofa', name: 'Sofa / Seating', icon: '🛋️', category: 'Living' },
  { id: 'chair', name: 'Chair / Stool', icon: '🪑', category: 'Living' },
  { id: 'cabinet', name: 'Cabinet / Credenza', icon: '🗄️', category: 'Living' },
  { id: 'bed', name: 'Bed / Master Suite', icon: '🛏️', category: 'Bedroom' },
  { id: 'lamp', name: 'Lamp / Lighting', icon: '💡', category: 'Lighting' },
  { id: 'door', name: 'Architectural Door', icon: '🚪', category: 'Doors & Windows' },
  { id: 'window', name: 'Glazed Window', icon: '🪟', category: 'Doors & Windows' },
  { id: 'bath', name: 'Bathtub / Sanitary', icon: '🛁', category: 'Bathroom' },
  { id: 'sink', name: 'Vanity / Basin', icon: '🚰', category: 'Bathroom' },
  { id: 'plant', name: 'Indoor Botanical', icon: '🪴', category: 'Decor' },
  { id: 'decor', name: 'Interior Decor / Vase', icon: '🏺', category: 'Decor' },
  { id: 'vehicle', name: 'Vehicle / Transport', icon: '🚗', category: 'Outdoor' },
];

// 2. Luxury PBR Materials & Finish Presets
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
  { name: 'Bouclé Cream', category: 'Fabric', color: '#f5f5f4', roughness: 0.85, metalness: 0.02 },
  { name: 'Smoked Glass', category: 'Glass', color: '#334155', roughness: 0.1, metalness: 0.1, opacity: 0.55 },
  { name: 'Ultra-Clear Glass', category: 'Glass', color: '#e0f2fe', roughness: 0.05, metalness: 0.05, opacity: 0.35 },
];

// 3. Designer Starter Blueprints for instant brand-new 3D objects
const DESIGNER_STARTERS = [
  {
    name: 'Modern Marble & Brass Coffee Table',
    category: 'Living',
    archetype: 'primitives',
    width: 120,
    depth: 65,
    height: 45,
    color: '#f8fafc',
    primitives: [
      { id: 'part_top', name: 'Carrara Marble Top', shape: 'box', width: 120, height: 4, depth: 65, x: 0, y: 43, z: 0, color: '#f8fafc', roughness: 0.15, metalness: 0.05 },
      { id: 'part_frame', name: 'Brushed Brass Apron', shape: 'box', width: 114, height: 3, depth: 59, x: 0, y: 39.5, z: 0, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'part_leg1', name: 'Brass Cylinder Leg FL', shape: 'cylinder', width: 5, height: 38, depth: 5, x: -54, y: 0, z: -26, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'part_leg2', name: 'Brass Cylinder Leg FR', shape: 'cylinder', width: 5, height: 38, depth: 5, x: 54, y: 0, z: -26, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'part_leg3', name: 'Brass Cylinder Leg BL', shape: 'cylinder', width: 5, height: 38, depth: 5, x: -54, y: 0, z: 26, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'part_leg4', name: 'Brass Cylinder Leg BR', shape: 'cylinder', width: 5, height: 38, depth: 5, x: 54, y: 0, z: 26, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'part_shelf', name: 'Smoked Glass Lower Shelf', shape: 'box', width: 106, height: 1.5, depth: 50, x: 0, y: 12, z: 0, color: '#334155', roughness: 0.1, metalness: 0.1, opacity: 0.6 },
    ] as CustomPrimitive[],
  },
  {
    name: 'Sculptural Minimalist Lounge Chair',
    category: 'Living',
    archetype: 'primitives',
    width: 80,
    depth: 85,
    height: 75,
    color: '#9a3412',
    primitives: [
      { id: 'p_seat', name: 'Leather Seat Cushion', shape: 'box', width: 70, height: 14, depth: 65, x: 0, y: 28, z: 0, color: '#9a3412', roughness: 0.45, metalness: 0.1 },
      { id: 'p_back', name: 'Tilted Backrest Cushion', shape: 'box', width: 70, height: 40, depth: 12, x: 0, y: 42, z: 30, rotX: -12, color: '#9a3412', roughness: 0.45, metalness: 0.1 },
      { id: 'p_base', name: 'Matte Steel Sled Base Left', shape: 'box', width: 3, height: 32, depth: 75, x: -33, y: 0, z: 5, color: '#18181b', roughness: 0.4, metalness: 0.8 },
      { id: 'p_base2', name: 'Matte Steel Sled Base Right', shape: 'box', width: 3, height: 32, depth: 75, x: 33, y: 0, z: 5, color: '#18181b', roughness: 0.4, metalness: 0.8 },
      { id: 'p_arm_l', name: 'Walnut Armrest Left', shape: 'box', width: 8, height: 3, depth: 55, x: -33, y: 48, z: 0, color: '#5c3d2e', roughness: 0.5, metalness: 0.05 },
      { id: 'p_arm_r', name: 'Walnut Armrest Right', shape: 'box', width: 8, height: 3, depth: 55, x: 33, y: 48, z: 0, color: '#5c3d2e', roughness: 0.5, metalness: 0.05 },
    ] as CustomPrimitive[],
  },
  {
    name: 'Floating Halo LED Ring Chandelier',
    category: 'Lighting',
    archetype: 'primitives',
    width: 90,
    depth: 90,
    height: 120,
    color: '#d97706',
    primitives: [
      { id: 'p_canopy', name: 'Ceiling Canopy Rose', shape: 'cylinder', width: 18, height: 4, depth: 18, x: 0, y: 116, z: 0, color: '#18181b', roughness: 0.3, metalness: 0.8 },
      { id: 'p_cable1', name: 'Steel Wire 1', shape: 'cylinder', width: 0.8, height: 80, depth: 0.8, x: -30, y: 76, z: 0, color: '#e2e8f0', roughness: 0.1, metalness: 0.95 },
      { id: 'p_cable2', name: 'Steel Wire 2', shape: 'cylinder', width: 0.8, height: 80, depth: 0.8, x: 30, y: 76, z: 0, color: '#e2e8f0', roughness: 0.1, metalness: 0.95 },
      { id: 'p_outer_ring', name: 'Brushed Brass Outer Ring', shape: 'torus', width: 85, height: 85, depth: 5, x: 0, y: 35, z: 0, rotX: 90, color: '#d97706', roughness: 0.25, metalness: 0.9 },
      { id: 'p_inner_ring', name: 'Diffused LED Light Ring', shape: 'torus', width: 78, height: 78, depth: 3.5, x: 0, y: 35, z: 0, rotX: 90, color: '#fef08a', roughness: 0.1, metalness: 0.1 },
    ] as CustomPrimitive[],
  },
  {
    name: 'Fluted Oak & Terrazzo Console',
    category: 'Living',
    archetype: 'primitives',
    width: 140,
    depth: 40,
    height: 85,
    color: '#d4a373',
    primitives: [
      { id: 'p_top', name: 'Terrazzo Stone Top', shape: 'box', width: 140, height: 5, depth: 40, x: 0, y: 80, z: 0, color: '#f5f5f4', roughness: 0.25, metalness: 0.05 },
      { id: 'p_body', name: 'Fluted Oak Cabinet Frame', shape: 'box', width: 132, height: 35, depth: 36, x: 0, y: 45, z: 0, color: '#d4a373', roughness: 0.65, metalness: 0.05 },
      { id: 'p_ped_l', name: 'Fluted Pillar Base Left', shape: 'cylinder', width: 22, height: 45, depth: 22, x: -45, y: 0, z: 0, color: '#d4a373', roughness: 0.65, metalness: 0.05 },
      { id: 'p_ped_r', name: 'Fluted Pillar Base Right', shape: 'cylinder', width: 22, height: 45, depth: 22, x: 45, y: 0, z: 0, color: '#d4a373', roughness: 0.65, metalness: 0.05 },
      { id: 'p_pull1', name: 'Brass Minimalist Handle 1', shape: 'cylinder', width: 2, height: 12, depth: 2, x: -15, y: 55, z: 19, rotZ: 90, color: '#d97706', roughness: 0.2, metalness: 0.95 },
      { id: 'p_pull2', name: 'Brass Minimalist Handle 2', shape: 'cylinder', width: 2, height: 12, depth: 2, x: 15, y: 55, z: 19, rotZ: 90, color: '#d97706', roughness: 0.2, metalness: 0.95 },
    ] as CustomPrimitive[],
  },
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
  const [creationMethod, setCreationMethod] = useState<'primitives' | 'parametric' | 'import_obj' | 'starters'>('primitives');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>('');

  // 3D Object Core State
  const [itemName, setItemName] = useState<string>('Custom 3D Object');
  const [category, setCategory] = useState<string>('Living');
  const [archetype, setArchetype] = useState<string>('primitives');
  const [widthCm, setWidthCm] = useState<number>(120);
  const [depthCm, setDepthCm] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(75);
  const [defaultElevation, setDefaultElevation] = useState<number>(0);
  const [price, setPrice] = useState<number>(14999);
  const [description, setDescription] = useState<string>('Bespoke custom 3D architectural object crafted in Studio.');

  // Multi-Part Primitives (for compound modeling)
  const [customPrimitives, setCustomPrimitives] = useState<CustomPrimitive[]>([
    { id: 'p_top', name: 'Top Surface', shape: 'box', width: 110, height: 5, depth: 65, x: 0, y: 70, z: 0, color: '#d4a373', roughness: 0.65, metalness: 0.05 },
    { id: 'p_leg_fl', name: 'Leg Front Left', shape: 'cylinder', width: 5, height: 70, depth: 5, x: -48, y: 0, z: -25, color: '#18181b', roughness: 0.45, metalness: 0.8 },
    { id: 'p_leg_fr', name: 'Leg Front Right', shape: 'cylinder', width: 5, height: 70, depth: 5, x: 48, y: 0, z: -25, color: '#18181b', roughness: 0.45, metalness: 0.8 },
    { id: 'p_leg_bl', name: 'Leg Back Left', shape: 'cylinder', width: 5, height: 70, depth: 5, x: -48, y: 0, z: 25, color: '#18181b', roughness: 0.45, metalness: 0.8 },
    { id: 'p_leg_br', name: 'Leg Back Right', shape: 'cylinder', width: 5, height: 70, depth: 5, x: 48, y: 0, z: 25, color: '#18181b', roughness: 0.45, metalness: 0.8 },
  ]);
  const [selectedPartId, setSelectedPartId] = useState<string>('p_top');

  // Imported OBJ Geometry state (if user uploads a 3D model)
  const [importedObjKey, setImportedObjKey] = useState<string | null>(null);
  const [importedObjFileName, setImportedObjFileName] = useState<string | null>(null);

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

  // Global PBR Material State
  const [baseColor, setBaseColor] = useState<string>('#d4a373');
  const [roughness, setRoughness] = useState<number>(0.55);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [opacity, setOpacity] = useState<number>(1.0);
  const [activeFinishName, setActiveFinishName] = useState<string>('Natural Oak');

  // Viewport Settings
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

  // Build the 3D model mesh (either from Custom Primitives, Imported OBJ, or Archetype)
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

    let builtGroup: THREE.Group = new THREE.Group();

    // CASE 1: Imported OBJ Model
    if (importedObjKey) {
      loadObjGeometry(importedObjKey)
        .then((geom) => {
          if (!sceneRef.current) return;
          const mesh = new THREE.Mesh(geom, mainMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Scale to specified bounding dimensions
          geom.computeBoundingBox();
          if (geom.boundingBox) {
            const size = new THREE.Vector3();
            geom.boundingBox.getSize(size);
            const targetX = (widthCm * CM) / Math.max(0.01, size.x);
            const targetY = (heightCm * CM) / Math.max(0.01, size.y);
            const targetZ = (depthCm * CM) / Math.max(0.01, size.z);
            mesh.scale.set(targetX, targetY, targetZ);
            mesh.position.y = (heightCm * CM) / 2;
          }

          const objGrp = new THREE.Group();
          objGrp.add(mesh);
          modelGroupRef.current = objGrp;
          sceneRef.current.add(objGrp);

          if (showDimensionsBox) {
            const box = new THREE.BoxHelper(objGrp, new THREE.Color(0x38bdf8));
            dimensionBoxRef.current = box;
            sceneRef.current.add(box);
          }
        })
        .catch((e) => console.warn('Could not render imported OBJ:', e));
      return;
    }

    // CASE 2: Multi-Part 3D Primitives Builder (Create New Custom 3D Objects from scratch)
    if (archetype === 'primitives') {
      builtGroup = buildCustomPrimitivesMeshGroup(customPrimitives, mainMaterial);

      // Re-calculate overall bounding dimensions from primitives
      let minX = 0, maxX = 0, minY = 0, maxY = 0, minZ = 0, maxZ = 0;
      customPrimitives.forEach((p) => {
        const halfW = (p.width || 10) / 2;
        const halfD = (p.depth || 10) / 2;
        const topY = (p.y || 0) + (p.height || 10);
        minX = Math.min(minX, (p.x || 0) - halfW);
        maxX = Math.max(maxX, (p.x || 0) + halfW);
        minZ = Math.min(minZ, (p.z || 0) - halfD);
        maxZ = Math.max(maxZ, (p.z || 0) + halfD);
        maxY = Math.max(maxY, topY);
      });
      const calculatedW = Math.round(maxX - minX);
      const calculatedD = Math.round(maxZ - minZ);
      const calculatedH = Math.round(maxY);
      if (calculatedW > 0) setWidthCm(calculatedW);
      if (calculatedD > 0) setDepthCm(calculatedD);
      if (calculatedH > 0) setHeightCm(calculatedH);
    } else {
      // CASE 3: Procedural Parametric Archetypes
      let params: any = {};
      if (archetype === 'table') {
        params = { shape: tableShape, legStyle: tableLegStyle, bevel: tableBevel, topThickness: tableTopThickness, legThickness: 5 };
      } else if (archetype === 'sofa') {
        params = { type: sofaType, cushionStyle: sofaCushion, armStyle: sofaArm, legStyle: sofaLegs };
      } else if (archetype === 'chair') {
        params = { seatType: chairSeat, backrestStyle: chairBack, legStyle: chairLegs, seatHeight: heightCm * 0.55 };
      } else if (archetype === 'cabinet') {
        params = { columns: cabinetCols, rows: cabinetRows, doorType: cabinetDoor, hasCrown: cabinetHasCrown, countertop: true, hasLegs: true };
      } else if (archetype === 'lamp') {
        params = { type: 'floor_arc', shadeWidth: widthCm * 0.4, shadeHeight: 25, totalHeight: heightCm };
      } else if (archetype === 'bed') {
        params = { headboardStyle: 'tufted', frameStyle: 'platform', hasNightstands: true };
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
    importedObjKey,
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

  // Update Studio Lights
  const updateLights = useCallback(() => {
    if (!sceneRef.current) return;
    if (lightsGroupRef.current) {
      sceneRef.current.remove(lightsGroupRef.current);
    }

    const lights = new THREE.Group();
    if (lightingPreset === 'studio') {
      const hemi = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.95);
      lights.add(hemi);
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
      keyLight.position.set(4, 7, 5);
      keyLight.castShadow = true;
      lights.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
      fillLight.position.set(-5, 4, -4);
      lights.add(fillLight);
    } else if (lightingPreset === 'warm') {
      const hemi = new THREE.HemisphereLight(0xfef3c7, 0x451a03, 0.85);
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

  // Load a Designer Starter Blueprint
  const handleLoadStarterBlueprint = (starter: typeof DESIGNER_STARTERS[0]) => {
    setDesignMode('create');
    setCreationMethod('primitives');
    setArchetype('primitives');
    setImportedObjKey(null);
    setItemName(starter.name);
    setCategory(starter.category);
    setWidthCm(starter.width);
    setDepthCm(starter.depth);
    setHeightCm(starter.height);
    setBaseColor(starter.color);
    setCustomPrimitives(JSON.parse(JSON.stringify(starter.primitives)));
    if (starter.primitives.length > 0) {
      setSelectedPartId(starter.primitives[0].id);
    }
    message.success(`Loaded "${starter.name}" blueprint into 3D Studio!`);
  };

  // Upload an external 3D file (.OBJ)
  const handleImportObjFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const customId = `obj_${Date.now()}`;
        const registeredKey = registerCustomObjGeometry(customId, text);
        setImportedObjKey(registeredKey);
        setImportedObjFileName(file.name);
        setItemName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setDesignMode('create');
        message.success(`✓ 3D Model file "${file.name}" imported and loaded into WebGL scene!`);
      } catch (err: any) {
        message.error(`Failed to parse 3D file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Load Existing Catalog Item for Redesign
  const handleSelectExistingItem = (itemId: string) => {
    const found = catalog.find((i) => i.id === itemId);
    if (!found) return;

    setSelectedCatalogId(found.id);
    setDesignMode('redesign');
    setImportedObjKey(null);
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
          if (parsed.primitives && Array.isArray(parsed.primitives)) {
            setCustomPrimitives(parsed.primitives);
            if (parsed.primitives.length > 0) setSelectedPartId(parsed.primitives[0].id);
          }
          if (parsed.shape) setTableShape(parsed.shape);
          if (parsed.legStyle) setTableLegStyle(parsed.legStyle);
          if (parsed.type) setSofaType(parsed.type);
          if (parsed.cushionStyle) setSofaCushion(parsed.cushionStyle);
          if (parsed.doorType) setCabinetDoor(parsed.doorType);
          if (parsed.seatType) setChairSeat(parsed.seatType);
        }
      } catch (e) {
        console.warn('Could not parse procedural json:', e);
      }
    } else if (found.model && found.model.startsWith('local_obj:')) {
      setImportedObjKey(found.model);
    }

    message.info(`Loaded "${found.name}" into 3D Studio for redesign`);
  };

  // Save as New 3D Catalog Item
  const handleSaveAsNew = async () => {
    if (!itemName.trim()) {
      message.error('Please enter a name for the 3D item');
      return;
    }

    setIsSaving(true);
    const newId = `item_${Date.now()}`;

    // Construct model string
    let modelString = '';
    if (importedObjKey) {
      modelString = importedObjKey;
    } else if (archetype === 'primitives') {
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
        await fetch('/api/catalog/furniture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      }
      message.success(`✨ Brand new 3D item "${newItem.name}" published to Catalog & Database!`);
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
    if (importedObjKey) {
      modelString = importedObjKey;
    } else if (archetype === 'primitives') {
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

  // Add a new sub-primitive part to the custom object
  const handleAddPrimitivePart = (shape: CustomPrimitive['shape'] = 'box') => {
    const newId = `part_${Date.now()}`;
    const newPart: CustomPrimitive = {
      id: newId,
      name: `New ${shape.toUpperCase()} Component`,
      shape,
      width: shape === 'cylinder' || shape === 'sphere' ? 25 : 50,
      height: 25,
      depth: shape === 'cylinder' || shape === 'sphere' ? 25 : 50,
      x: 0,
      y: 0,
      z: 0,
      color: baseColor,
      roughness: 0.5,
      metalness: 0.1,
      visible: true,
    };
    setCustomPrimitives((prev) => [...prev, newPart]);
    setSelectedPartId(newId);
    setArchetype('primitives');
    setImportedObjKey(null);
    message.success(`Added new ${shape} part to custom 3D model!`);
  };

  // Duplicate an existing primitive part
  const handleDuplicatePart = (partId: string) => {
    const source = customPrimitives.find((p) => p.id === partId);
    if (!source) return;
    const cloned: CustomPrimitive = {
      ...source,
      id: `part_${Date.now()}`,
      name: `${source.name || 'Component'} (Copy)`,
      x: (source.x || 0) + 10,
      z: (source.z || 0) + 10,
    };
    setCustomPrimitives((prev) => [...prev, cloned]);
    setSelectedPartId(cloned.id);
    message.success(`Duplicated part "${source.name}"!`);
  };

  // Delete a primitive part
  const handleRemovePrimitivePart = (partId: string) => {
    if (customPrimitives.length <= 1) {
      message.warning('A custom 3D object must have at least one component part.');
      return;
    }
    setCustomPrimitives((prev) => prev.filter((p) => p.id !== partId));
    if (selectedPartId === partId) {
      setSelectedPartId(customPrimitives[0]?.id || '');
    }
  };

  // Update specific field of active selected part
  const updateSelectedPart = (updates: Partial<CustomPrimitive>) => {
    setCustomPrimitives((prev) =>
      prev.map((p) => (p.id === selectedPartId ? { ...p, ...updates } : p))
    );
  };

  // Active selected part
  const activePart = customPrimitives.find((p) => p.id === selectedPartId) || customPrimitives[0];

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

    // Studio Circular Pedestal Disc
    const pedestalGeom = new THREE.CylinderGeometry(2.4, 2.5, 0.04, 64);
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
              <h2 className="text-sm font-bold text-white tracking-wide m-0">3D Object Design & Modeling Studio</h2>
              <Tag color="purple" style={{ fontSize: 10, margin: 0, fontWeight: 700 }}>
                ADMIN EXCLUSIVE
              </Tag>
              <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                FULL 3D CAD ENGINE
              </Tag>
            </div>
            <p className="text-[11px] text-slate-400 m-0">
              Create brand-new 3D objects from scratch, build multi-part compound primitives, or redesign existing assets
            </p>
          </div>
        </div>

        {/* Top Creation Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
            <Button
              type={designMode === 'create' ? 'primary' : 'text'}
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setDesignMode('create');
                setItemName('New Custom 3D Object');
                setSelectedCatalogId('');
                setCapturedThumbnail(null);
              }}
              style={{ fontSize: 11, fontWeight: designMode === 'create' ? 700 : 500 }}
            >
              ✨ Create Brand New 3D Object
            </Button>
            <Button
              type={designMode === 'redesign' ? 'primary' : 'text'}
              size="small"
              icon={<EditOutlined />}
              onClick={() => setDesignMode('redesign')}
              style={{ fontSize: 11, fontWeight: designMode === 'redesign' ? 700 : 500 }}
            >
              ✏️ Redesign Existing Catalog Object
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SUB-BAR: Creation Method Pills when Creating Brand-New Object */}
      {designMode === 'create' && (
        <div className="px-5 py-2 bg-[#090e1a] border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Creation Method:</span>
            <Button
              size="small"
              type={creationMethod === 'primitives' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => {
                setCreationMethod('primitives');
                setArchetype('primitives');
                setImportedObjKey(null);
              }}
              style={{ fontSize: 11 }}
            >
              🧱 Multi-Part 3D Modeler
            </Button>
            <Button
              size="small"
              type={creationMethod === 'parametric' ? 'primary' : 'default'}
              icon={<SlidersOutlined />}
              onClick={() => {
                setCreationMethod('parametric');
                setImportedObjKey(null);
              }}
              style={{ fontSize: 11 }}
            >
              📐 Architectural Archetypes
            </Button>
            <Button
              size="small"
              type={creationMethod === 'starters' ? 'primary' : 'default'}
              icon={<BulbOutlined />}
              onClick={() => {
                setCreationMethod('starters');
                setImportedObjKey(null);
              }}
              style={{ fontSize: 11 }}
            >
              💡 Designer Blueprints
            </Button>
            <label className="cursor-pointer">
              <Button
                size="small"
                type={creationMethod === 'import_obj' ? 'primary' : 'default'}
                icon={<ImportOutlined />}
                onClick={() => setCreationMethod('import_obj')}
                style={{ fontSize: 11 }}
              >
                📁 Upload .OBJ Model
              </Button>
              <input type="file" accept=".obj" onChange={handleImportObjFile} className="hidden" />
            </label>
          </div>

          {importedObjFileName && (
            <Tag color="green" closable onClose={() => { setImportedObjKey(null); setImportedObjFileName(null); }}>
              Loaded OBJ: {importedObjFileName}
            </Tag>
          )}
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: PARTS TREE & BLUEPRINTS */}
        <div className="w-80 border-r border-slate-800/80 bg-[#080f1e]/90 flex flex-col shrink-0 overflow-y-auto">
          {designMode === 'redesign' ? (
            /* Redesign Catalog Browser */
            <div className="p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Pick Existing Item to Redesign
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
          ) : creationMethod === 'starters' ? (
            /* Designer Starter Blueprints */
            <div className="p-3 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                Pick a Designer Starting Point:
              </span>
              {DESIGNER_STARTERS.map((s) => (
                <div
                  key={s.name}
                  onClick={() => handleLoadStarterBlueprint(s)}
                  className="p-3 rounded-xl border border-slate-800 bg-[#0f172a]/80 hover:border-sky-500/70 hover:bg-[#0f172a] cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{s.name}</span>
                    <Tag color="blue" style={{ fontSize: 9 }}>{s.category}</Tag>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {s.width} × {s.depth} × {s.height} cm • {s.primitives.length} Components
                  </div>
                </div>
              ))}
            </div>
          ) : creationMethod === 'parametric' ? (
            /* Parametric Archetype Selector */
            <div className="p-3 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                Select Base Parametric Archetype:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {ARCHETYPES.filter((a) => a.id !== 'primitives').map((arch) => {
                  const isSelected = archetype === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        setArchetype(arch.id);
                        setCategory(arch.category);
                        setItemName(`New Custom ${arch.name.split('/')[0].trim()}`);
                        setImportedObjKey(null);
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
          ) : (
            /* Multi-Part 3D Modeler Parts List */
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  3D Component Parts ({customPrimitives.length})
                </span>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddPrimitivePart('box')}
                  style={{ fontSize: 11, backgroundColor: '#0284c7' }}
                >
                  Add Part
                </Button>
              </div>

              {/* Add Primitive Quick Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                <Button size="small" type="dashed" onClick={() => handleAddPrimitivePart('box')} style={{ fontSize: 10 }}>+ Box</Button>
                <Button size="small" type="dashed" onClick={() => handleAddPrimitivePart('cylinder')} style={{ fontSize: 10 }}>+ Cylinder</Button>
                <Button size="small" type="dashed" onClick={() => handleAddPrimitivePart('sphere')} style={{ fontSize: 10 }}>+ Sphere</Button>
                <Button size="small" type="dashed" onClick={() => handleAddPrimitivePart('torus')} style={{ fontSize: 10 }}>+ Torus</Button>
                <Button size="small" type="dashed" onClick={() => handleAddPrimitivePart('capsule')} style={{ fontSize: 10 }}>+ Capsule</Button>
              </div>

              {/* Parts List */}
              <div className="space-y-1.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {customPrimitives.map((part, idx) => {
                  const isSelected = selectedPartId === part.id;
                  return (
                    <div
                      key={part.id}
                      onClick={() => setSelectedPartId(part.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                          : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: part.color || baseColor }} />
                          <span className="font-bold text-[11px] truncate max-w-[130px]">
                            {part.name || `Part #${idx + 1}`}
                          </span>
                        </div>
                        <Tag color="cyan" style={{ fontSize: 9, margin: 0 }}>{part.shape.toUpperCase()}</Tag>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{part.width}×{part.height}×{part.depth} cm</span>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Clone Part">
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={(e) => { e.stopPropagation(); handleDuplicatePart(part.id); }}
                              style={{ padding: '0 4px', height: 18, color: '#38bdf8' }}
                            />
                          </Tooltip>
                          <Tooltip title="Delete Part">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={(e) => { e.stopPropagation(); handleRemovePrimitivePart(part.id); }}
                              style={{ padding: '0 4px', height: 18 }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              <Button size="small" type="text" onClick={() => setPresetAngle('iso')} style={{ fontSize: 11 }}>📐 Iso</Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('front')} style={{ fontSize: 11 }}>👁️ Front</Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('top')} style={{ fontSize: 11 }}>🔝 Top</Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('side')} style={{ fontSize: 11 }}>➡️ Side</Button>
              <Button size="small" type="text" onClick={() => setPresetAngle('back')} style={{ fontSize: 11 }}>🔙 Back</Button>
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
              <Tooltip title="Capture 3D Snapshot for Catalog Icon">
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
                <span className="text-[10px] text-sky-400 font-bold uppercase block">3D Snapshot Ready</span>
                <span className="text-[11px] text-slate-300">Will be saved as item icon</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: ACTIVE PART INSPECTOR & PARAMETER STUDIO */}
        <div className="w-96 border-l border-slate-800/80 bg-[#0f172a]/95 flex flex-col shrink-0 overflow-y-auto">
          <Tabs
            defaultActiveKey="part_inspector"
            tabBarStyle={{ margin: 0, padding: '0 16px', borderBottom: '1px solid #1e293b' }}
            items={[
              {
                key: 'part_inspector',
                label: (
                  <Space orientation="horizontal" size={4}>
                    <ToolOutlined />
                    <span>Active Component</span>
                  </Space>
                ),
                children: (
                  <div className="p-4 space-y-4">
                    {/* Component Name & Shape */}
                    {activePart ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider text-[10px]">
                              Editing: {activePart.name || 'Component'}
                            </span>
                            <Select
                              value={activePart.shape}
                              onChange={(shape) => updateSelectedPart({ shape })}
                              size="small"
                              style={{ width: 110 }}
                              options={[
                                { value: 'box', label: 'Cube / Box' },
                                { value: 'cylinder', label: 'Cylinder' },
                                { value: 'sphere', label: 'Sphere' },
                                { value: 'torus', label: 'Torus / Ring' },
                                { value: 'capsule', label: 'Capsule' },
                                { value: 'cone', label: 'Cone' },
                              ]}
                            />
                          </div>

                          <Input
                            size="small"
                            value={activePart.name}
                            onChange={(e) => updateSelectedPart({ name: e.target.value })}
                            placeholder="Component Label"
                            className="bg-[#080f1e] border-slate-700 text-xs"
                          />
                        </div>

                        {/* Dimensions & Scale */}
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                            Component Dimensions (cm)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Width (X)</span>
                              <InputNumber
                                min={1}
                                max={500}
                                value={activePart.width}
                                onChange={(w) => updateSelectedPart({ width: w || 10 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Height (Y)</span>
                              <InputNumber
                                min={1}
                                max={500}
                                value={activePart.height}
                                onChange={(h) => updateSelectedPart({ height: h || 10 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Depth (Z)</span>
                              <InputNumber
                                min={1}
                                max={500}
                                value={activePart.depth}
                                onChange={(d) => updateSelectedPart({ depth: d || 10 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Local Positions */}
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                            Position Offsets (X, Y, Z in cm)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">X Offset</span>
                              <InputNumber
                                min={-300}
                                max={300}
                                value={activePart.x || 0}
                                onChange={(x) => updateSelectedPart({ x: x || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Y Offset (Height)</span>
                              <InputNumber
                                min={-300}
                                max={300}
                                value={activePart.y || 0}
                                onChange={(y) => updateSelectedPart({ y: y || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Z Offset</span>
                              <InputNumber
                                min={-300}
                                max={300}
                                value={activePart.z || 0}
                                onChange={(z) => updateSelectedPart({ z: z || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Local Rotations */}
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                            Rotations (Degrees)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Rot X</span>
                              <InputNumber
                                min={-180}
                                max={180}
                                value={activePart.rotX || 0}
                                onChange={(rotX) => updateSelectedPart({ rotX: rotX || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Rot Y</span>
                              <InputNumber
                                min={-180}
                                max={180}
                                value={activePart.rotY || 0}
                                onChange={(rotY) => updateSelectedPart({ rotY: rotY || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Rot Z</span>
                              <InputNumber
                                min={-180}
                                max={180}
                                value={activePart.rotZ || 0}
                                onChange={(rotZ) => updateSelectedPart({ rotZ: rotZ || 0 })}
                                size="small"
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Part Specific Material & Color */}
                        <Divider style={{ borderColor: '#1e293b', margin: '8px 0' }} />
                        <div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                            Component Finish & Color
                          </span>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={activePart.color || baseColor}
                              onChange={(e) => updateSelectedPart({ color: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                            />
                            <div className="flex-1 grid grid-cols-4 gap-1">
                              {['#d4a373', '#5c3d2e', '#d97706', '#18181b', '#f8fafc', '#1e3a8a', '#064e3b', '#334155'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateSelectedPart({ color: c })}
                                  className="w-6 h-6 rounded border border-white/20 cursor-pointer"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Alert message="Select a component from the left panel to edit its dimensions, offsets, and materials." type="info" />
                    )}
                  </div>
                ),
              },
              {
                key: 'global_materials',
                label: (
                  <Space orientation="horizontal" size={4}>
                    <BgColorsOutlined />
                    <span>Finishes</span>
                  </Space>
                ),
                children: (
                  <div className="p-4 space-y-4">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-2">
                      Apply Architectural Finishes
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
                              if (activePart) {
                                updateSelectedPart({
                                  color: fin.color,
                                  roughness: fin.roughness,
                                  metalness: fin.metalness,
                                  opacity: fin.opacity || 1.0,
                                });
                              }
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

                    <Divider style={{ borderColor: '#1e293b', margin: '8px 0' }} />

                    {/* Fine PBR Sliders */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Surface Roughness</span>
                          <span className="font-mono text-sky-400">{roughness.toFixed(2)}</span>
                        </div>
                        <Slider min={0.02} max={1.0} step={0.01} value={roughness} onChange={(v) => setRoughness(v)} />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Metalness / Polish</span>
                          <span className="font-mono text-amber-400">{metalness.toFixed(2)}</span>
                        </div>
                        <Slider min={0.0} max={1.0} step={0.01} value={metalness} onChange={(v) => setMetalness(v)} />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Opacity / Glass Transparency</span>
                          <span className="font-mono text-emerald-400">{opacity.toFixed(2)}</span>
                        </div>
                        <Slider min={0.1} max={1.0} step={0.05} value={opacity} onChange={(v) => setOpacity(v)} />
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
                        placeholder="e.g. Bespoke Marble Dining Table"
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
                        placeholder="Dimensions, materials, finishes, and designer notes"
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
              ✨ Publish New 3D Object to Catalog
            </Button>

            {onAddItemToPlan && (
              <Button
                type="default"
                icon={<AppstoreOutlined />}
                onClick={() => {
                  let modelString = '';
                  if (importedObjKey) {
                    modelString = importedObjKey;
                  } else if (archetype === 'primitives') {
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
                📥 Add Directly to Active Project Scene
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
