'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  X,
  Box,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Maximize,
  Upload,
  Eye,
  Info,
  Layers,
  Shapes,
  Hammer,
  FolderOpen,
  HelpCircle
} from 'lucide-react';
import { CatalogItem } from '../types/plan';
import {
  buildProceduralMeshGroup,
  TableParams,
  ChairParams,
  SofaParams,
  CabinetParams,
  BedParams,
  LampParams,
} from '../services/proceduralFurniture';
import { registerCustomObjGeometry, loadObjGeometry } from '../services/objParser';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: CatalogItem, autoPlaceInScene?: boolean) => void;
}

type StudioMode = 'sculpt' | 'import_obj';
type Archetype = 'table' | 'chair' | 'sofa' | 'cabinet' | 'bed' | 'lamp';

interface ArchetypeOption {
  id: Archetype;
  label: string;
  category: string;
  desc: string;
  defaultW: number;
  defaultD: number;
  defaultH: number;
  defaultColor: string;
}

const ARCHETYPES: ArchetypeOption[] = [
  {
    id: 'table',
    label: 'Dining Table & Desk',
    category: 'Living',
    desc: 'Bespoke dining tables, executive desks, coffee & accent tables',
    defaultW: 160,
    defaultD: 90,
    defaultH: 75,
    defaultColor: '#5c3d2e',
  },
  {
    id: 'chair',
    label: 'Chairs & Stools',
    category: 'Living',
    desc: 'Dining chairs, upholstered side chairs, bar stools',
    defaultW: 50,
    defaultD: 50,
    defaultH: 85,
    defaultColor: '#1e3a8a',
  },
  {
    id: 'sofa',
    label: 'Sofa & Lounge',
    category: 'Living',
    desc: '2-seater, 3-seater, luxury sectionals with chaise',
    defaultW: 210,
    defaultD: 95,
    defaultH: 80,
    defaultColor: '#18181b',
  },
  {
    id: 'cabinet',
    label: 'Cabinet & Storage',
    category: 'Kitchen',
    desc: 'Modular credenzas, kitchen cabinets, open shelving units',
    defaultW: 120,
    defaultD: 45,
    defaultH: 90,
    defaultColor: '#d4a373',
  },
  {
    id: 'bed',
    label: 'Bed & Bedroom Suite',
    category: 'Bedroom',
    desc: 'King, Queen, single platform beds with custom headboards',
    defaultW: 160,
    defaultD: 200,
    defaultH: 90,
    defaultColor: '#064e3b',
  },
  {
    id: 'lamp',
    label: 'Lighting Fixtures',
    category: 'Lighting',
    desc: 'Ceiling pendants, orb chandeliers, modern cone lamps',
    defaultW: 40,
    defaultD: 40,
    defaultH: 60,
    defaultColor: '#eab308',
  },
];

const STYLE_PRESETS = [
  { id: 'scandi_oak', name: 'Scandi Oak', color: '#d4a373', roughness: 0.7, metalness: 0.05, opacity: 1.0 },
  { id: 'warm_walnut', name: 'Rich Walnut', color: '#5c3d2e', roughness: 0.45, metalness: 0.05, opacity: 1.0 },
  { id: 'navy_velvet', name: 'Royal Velvet', color: '#1e3a8a', roughness: 0.5, metalness: 0.2, opacity: 1.0 },
  { id: 'emerald_luxe', name: 'Emerald Velvet', color: '#064e3b', roughness: 0.45, metalness: 0.2, opacity: 1.0 },
  { id: 'matte_charcoal', name: 'Matte Charcoal', color: '#18181b', roughness: 0.7, metalness: 0.5, opacity: 1.0 },
  { id: 'carrara_marble', name: 'Carrara Marble', color: '#f8fafc', roughness: 0.15, metalness: 0.1, opacity: 1.0 },
  { id: 'brushed_brass', name: 'Brushed Brass', color: '#eab308', roughness: 0.25, metalness: 0.85, opacity: 1.0 },
  { id: 'clear_glass', name: 'Smoked Glass', color: '#334155', roughness: 0.08, metalness: 0.2, opacity: 0.45 },
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>('sculpt');
  const [archetype, setArchetype] = useState<Archetype>('table');
  const [name, setName] = useState('Custom Bespoke Dining Table');
  const [category, setCategory] = useState('Living');

  // Dimensions (cm)
  const [width, setWidth] = useState(160);
  const [depth, setDepth] = useState(90);
  const [height, setHeight] = useState(75);

  // Materials & PBR
  const [color, setColor] = useState('#5c3d2e');
  const [roughness, setRoughness] = useState(0.45);
  const [metalness, setMetalness] = useState(0.05);
  const [opacity, setOpacity] = useState(1.0);
  const [stylePreset, setStylePreset] = useState<string>('warm_walnut');

  // Table specific parameters
  const [tableShape, setTableShape] = useState<'rectangular' | 'round' | 'oval' | 'hexagonal'>('rectangular');
  const [tableLegStyle, setTableLegStyle] = useState<'4_legs_corner' | 'trestle_base' | 'pedestal_column' | 'hairpin_metal' | 'cross_x_legs'>('4_legs_corner');
  const [tableTopThickness, setTableTopThickness] = useState(4);
  const [tableLegThickness, setTableLegThickness] = useState(6);

  // Chair specific parameters
  const [chairSeatType, setChairSeatType] = useState<'cushioned' | 'wood_plank' | 'curved_shell'>('cushioned');
  const [chairBackrestStyle, setChairBackrestStyle] = useState<'solid_panel' | 'spindle_slats' | 'wingback' | 'backless'>('solid_panel');
  const [chairLegStyle, setChairLegStyle] = useState<'tapered_wood' | 'metal_sled' | 'swivel_pedestal' | 'straight_4'>('straight_4');

  // Sofa specific parameters
  const [sofaType, setSofaType] = useState<'straight_2_seater' | 'straight_3_seater' | 'l_shape_left' | 'l_shape_right'>('straight_3_seater');
  const [sofaArmStyle, setSofaArmStyle] = useState<'track_arm' | 'rolled_arm' | 'armless'>('track_arm');
  const [sofaCushionStyle, setSofaCushionStyle] = useState<'plump' | 'tufted' | 'minimal'>('plump');

  // Cabinet specific parameters
  const [cabinetColumns, setCabinetColumns] = useState(2);
  const [cabinetRows, setCabinetRows] = useState(2);
  const [cabinetDoorType, setCabinetDoorType] = useState<'open_shelf' | 'solid_doors' | 'glass_doors' | 'drawers'>('solid_doors');
  const [cabinetHasLegs, setCabinetHasLegs] = useState(true);

  // Bed specific parameters
  const [bedHeadboardStyle, setBedHeadboardStyle] = useState<'tufted' | 'wood_slat' | 'floating_panel' | 'wingback' | 'none'>('tufted');
  const [bedFrameStyle, setBedFrameStyle] = useState<'platform' | 'upholstered_box' | 'canopy'>('platform');
  const [bedHasNightstands, setBedHasNightstands] = useState(false);

  // Lamp specific parameters
  const [lampType, setLampType] = useState<'pendant_dome' | 'pendant_cone' | 'floor_arc' | 'table_lamp' | 'globe_orb'>('pendant_dome');
  const [lightColor, setLightColor] = useState('#fef08a');
  const [lightIntensity, setLightIntensity] = useState(1.2);
  const [placementSurface, setPlacementSurface] = useState<'floor' | 'tabletop' | 'ceiling' | 'wall'>('floor');

  // Local OBJ Import states
  const [importedObjKey, setImportedObjKey] = useState<string | null>(null);
  const [importedFileName, setImportedFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [autoPlaceInScene, setAutoPlaceInScene] = useState(true);

  // 3D Canvas Preview Refs
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingPreviewRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ radius: 3.2, theta: 0.7, phi: 1.1 });

  // Handle Archetype Switch
  const handleSelectArchetype = (archId: Archetype) => {
    setArchetype(archId);
    const opt = ARCHETYPES.find((a) => a.id === archId);
    if (opt) {
      setCategory(opt.category);
      setWidth(opt.defaultW);
      setDepth(opt.defaultD);
      setHeight(opt.defaultH);
      setColor(opt.defaultColor);
      setName(`Custom Bespoke ${opt.label}`);
    }
  };

  // Build Procedural Config Object
  const getProceduralConfig = useCallback((): any => {
    switch (archetype) {
      case 'table':
        return {
          shape: tableShape,
          legStyle: tableLegStyle,
          topThickness: tableTopThickness,
          legThickness: tableLegThickness,
          bevel: true,
        };
      case 'chair':
        return {
          seatType: chairSeatType,
          backrestStyle: chairBackrestStyle,
          legStyle: chairLegStyle,
          seatHeight: 45,
        };
      case 'sofa':
        return {
          type: sofaType,
          cushionStyle: sofaCushionStyle,
          armStyle: sofaArmStyle,
          legStyle: 'wooden_pegs',
        };
      case 'cabinet':
        return {
          columns: cabinetColumns,
          rows: cabinetRows,
          doorType: cabinetDoorType,
          hasLegs: cabinetHasLegs,
        };
      case 'bed':
        return {
          headboardStyle: bedHeadboardStyle,
          frameStyle: bedFrameStyle,
          hasNightstands: bedHasNightstands,
        };
      case 'lamp':
        return {
          type: lampType,
          shadeWidth: width,
          shadeHeight: depth,
          totalHeight: height,
        };
      default:
        return {};
    }
  }, [
    archetype,
    tableShape,
    tableLegStyle,
    tableTopThickness,
    tableLegThickness,
    chairSeatType,
    chairBackrestStyle,
    chairLegStyle,
    sofaType,
    sofaCushionStyle,
    sofaArmStyle,
    cabinetColumns,
    cabinetRows,
    cabinetDoorType,
    cabinetHasLegs,
    bedHeadboardStyle,
    bedFrameStyle,
    bedHasNightstands,
    lampType,
    width,
    depth,
    height,
  ]);

  // Three.js Preview Initializer
  useEffect(() => {
    if (!isOpen) return;
    const mount = canvasMountRef.current;
    if (!mount) return;

    const widthPx = mount.clientWidth || 400;
    const heightPx = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, widthPx / heightPx, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(widthPx, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffdfa, 2.0);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    fillLight.position.set(-5, 6, -5);
    scene.add(fillLight);

    // Studio Ground Circle
    const groundGeom = new THREE.CircleGeometry(3.0, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.005;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(4, 16, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const group = new THREE.Group();
    scene.add(group);
    meshGroupRef.current = group;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (camera && renderer && scene) {
        const o = orbitRef.current;
        const x = o.radius * Math.sin(o.phi) * Math.sin(o.theta);
        const y = o.radius * Math.cos(o.phi);
        const z = o.radius * Math.sin(o.phi) * Math.cos(o.theta);
        camera.position.set(x, Math.max(0.2, y), z);
        camera.lookAt(0, (height * 0.01) / 2 || 0.4, 0);
        renderer.render(scene, camera);
      }
    };
    animate();

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, height]);

  // Update Preview Mesh on parameters change
  useEffect(() => {
    if (!isOpen || !meshGroupRef.current) return;
    const group = meshGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const CM = 0.01;
    const wM = width * CM;
    const dM = depth * CM;
    const hM = height * CM;

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color || '#5c3d2e'),
      roughness: roughness,
      metalness: metalness,
      opacity: opacity,
      transparent: opacity < 1.0,
    });

    if (studioMode === 'import_obj' && importedObjKey) {
      loadObjGeometry(`local_obj:${importedObjKey}`).then((geom) => {
        geom.computeBoundingBox();
        const bbox = geom.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const scaleX = size.x > 0 ? wM / size.x : wM;
        const scaleY = size.y > 0 ? hM / size.y : hM;
        const scaleZ = size.z > 0 ? dM / size.z : dM;

        const mesh = new THREE.Mesh(geom, baseMaterial);
        mesh.scale.set(scaleX, scaleY, scaleZ);
        mesh.position.y = hM / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      });
    } else if (studioMode === 'sculpt') {
      const config = getProceduralConfig();
      const proceduralGroup = buildProceduralMeshGroup(archetype, config, width, depth, height, baseMaterial);
      group.add(proceduralGroup);

      if (archetype === 'lamp') {
        const spot = new THREE.PointLight(new THREE.Color(lightColor || '#fef08a'), lightIntensity * 1.5, 4);
        spot.position.y = hM;
        group.add(spot);
      }
    }
  }, [
    isOpen,
    studioMode,
    archetype,
    importedObjKey,
    width,
    depth,
    height,
    color,
    roughness,
    metalness,
    opacity,
    lightColor,
    lightIntensity,
    getProceduralConfig,
  ]);

  // Handle Local .OBJ File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setImportedFileName(file.name);
    setName(fileNameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const customId = `local_obj_${Date.now()}`;
        registerCustomObjGeometry(customId, text);
        setImportedObjKey(customId);
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      alert('Failed to read 3D OBJ file');
    };
    reader.readAsText(file);
  };

  // Preview Orbit Controls Handlers
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    isDraggingPreviewRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPreviewRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    orbitRef.current.theta -= dx * 0.015;
    orbitRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.05, orbitRef.current.phi - dy * 0.015));
  };

  const handlePreviewMouseUp = () => {
    isDraggingPreviewRef.current = false;
  };

  const handlePreviewWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    orbitRef.current.radius = Math.max(1.0, Math.min(7.0, orbitRef.current.radius + e.deltaY * 0.003));
  };

  // Handle Save & Add to Catalog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let modelUri = '';
    let iconUri = '/models/armchair.png';

    if (studioMode === 'import_obj' && importedObjKey) {
      modelUri = `local_obj:${importedObjKey}`;
      iconUri = '/models/sofa.png';
    } else {
      const config = getProceduralConfig();
      modelUri = `procedural:${archetype}:${JSON.stringify(config)}`;
      if (archetype === 'table') iconUri = '/models/squareTable.png';
      else if (archetype === 'chair') iconUri = '/models/chair.png';
      else if (archetype === 'sofa') iconUri = '/models/sofa.png';
      else if (archetype === 'cabinet') iconUri = '/models/kitchenCabinet.png';
      else if (archetype === 'bed') iconUri = '/models/bed140x190.png';
      else if (archetype === 'lamp') iconUri = '/models/pendantLamp.png';
    }

    const newItem: CatalogItem = {
      id: `custom_${Date.now()}`,
      name,
      category,
      model: modelUri,
      icon: iconUri,
      width: Number(width),
      depth: Number(depth),
      height: Number(height),
      defaultColor: color,
      roughness,
      metalness,
      opacity,
      stylePreset,
      lightIntensity: archetype === 'lamp' ? lightIntensity : undefined,
      lightColor: archetype === 'lamp' ? lightColor : undefined,
      placementType: placementSurface,
      placeOnTable: placementSurface === 'tabletop',
      isCustom: true,
    };

    onAddItem(newItem, autoPlaceInScene);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">3D Item Sculptor & Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  New Item Creator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sculpt custom 3D furniture from scratch or import local 3D model files with real-time WebGL preview.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 shrink-0">
          <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Creation Method:</span>
          <button
            type="button"
            onClick={() => setStudioMode('sculpt')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              studioMode === 'sculpt'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200 ring-2 ring-sky-100'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>🛠️ Sculpt from Scratch (Tables, Sofas, Beds...)</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioMode('import_obj')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              studioMode === 'import_obj'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 ring-2 ring-indigo-100'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>📁 Import Local 3D File (.OBJ)</span>
          </button>
        </div>

        {/* 2-Column Body: Controls (Left 7) & Live 3D Preview (Right 5) */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Controls Column (7 cols) */}
          <div className="col-span-7 overflow-y-auto p-5 space-y-4 custom-scrollbar border-r border-slate-200">
            {/* Placement Surface & Auto-Attachment Control */}
            <div className="bg-sky-50/60 border border-sky-200/80 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-sky-950">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Placement Surface & Floor Rules</span>
                </span>
                <span className="text-[10px] text-sky-800 font-mono font-bold uppercase bg-white px-2 py-0.5 rounded border border-sky-200">
                  {placementSurface === 'tabletop' ? '🍽️ On Table (Auto-Attach)' : placementSurface}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'floor', label: '🏠 Floor Standing', desc: 'Standard furniture' },
                  { id: 'tabletop', label: '🍽️ On Tabletop', desc: 'Auto-attach / Floor restricted' },
                  { id: 'ceiling', label: '💡 Ceiling Mounted', desc: 'Suspended fixtures' },
                  { id: 'wall', label: '🧱 Wall Mounted', desc: 'Wall decorations' },
                ].map((s) => {
                  const isSelected = placementSurface === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPlacementSurface(s.id as any)}
                      className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-sky-500 ring-2 ring-sky-100 shadow-xs'
                          : 'bg-white/80 hover:bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-800 truncate block">
                        {s.label}
                      </span>
                      <span className="text-[9px] text-slate-500 line-clamp-1 block mt-0.5">
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {placementSurface === 'tabletop' && (
                <div className="p-2 bg-white/90 rounded-xl border border-sky-200 text-[11px] text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>
                    <strong>Tabletop Protection:</strong> When saved, this item automatically sits flush on top of any table/counter and cannot be accidentally placed on the bare floor.
                  </span>
                </div>
              )}
            </div>

            {/* 1. Item Identity */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Item Identity & Categorization</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Modern Solid Teak Dining Table"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Catalog Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-sky-500 shadow-2xs cursor-pointer"
                  >
                    {['Living', 'Bedroom', 'Kitchen', 'Bathroom', 'Lighting', 'Decor & Plants', 'Custom'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sculpt Mode: Archetype Selector & Parametric Controls */}
            {studioMode === 'sculpt' && (
              <>
                {/* Archetype Selector */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <Shapes className="w-4 h-4 text-sky-600" />
                      <span>Select Furniture Archetype</span>
                    </span>
                    <span className="text-[10px] text-sky-700 font-mono font-bold">
                      {ARCHETYPES.find((a) => a.id === archetype)?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {ARCHETYPES.map((arch) => {
                      const isSelected = archetype === arch.id;
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => handleSelectArchetype(arch.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-sm'
                              : 'bg-white hover:bg-slate-100/70 border-slate-200 shadow-2xs'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800 truncate">{arch.label}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{arch.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Parametric Specific Controls */}
                <div className="bg-indigo-50/50 border border-indigo-200/80 p-3.5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Parametric Sculpting Controls ({archetype.toUpperCase()})</span>
                  </div>

                  {/* Table Archetype Controls */}
                  {archetype === 'table' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Tabletop Shape</label>
                        <select
                          value={tableShape}
                          onChange={(e) => setTableShape(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="rectangular">Rectangular Table</option>
                          <option value="round">Round / Circular Table</option>
                          <option value="hexagonal">Hexagonal / Geometric Table</option>
                          <option value="oval">Oval Classic</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Leg Structure</label>
                        <select
                          value={tableLegStyle}
                          onChange={(e) => setTableLegStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="4_legs_corner">4 Corner Legs</option>
                          <option value="pedestal_column">Center Column Pedestal</option>
                          <option value="trestle_base">Double Trestle Base</option>
                          <option value="cross_x_legs">Cross X-Legs</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Tabletop Thickness ({tableTopThickness} cm)
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="10"
                          value={tableTopThickness}
                          onChange={(e) => setTableTopThickness(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Leg Thickness ({tableLegThickness} cm)
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={tableLegThickness}
                          onChange={(e) => setTableLegThickness(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Chair Archetype Controls */}
                  {archetype === 'chair' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Backrest Type</label>
                        <select
                          value={chairBackrestStyle}
                          onChange={(e) => setChairBackrestStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="solid_panel">Solid High Panel</option>
                          <option value="spindle_slats">Slatted Spindles</option>
                          <option value="wingback">Wingback Comfort</option>
                          <option value="backless">Backless Stool</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Seat Type</label>
                        <select
                          value={chairSeatType}
                          onChange={(e) => setChairSeatType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="cushioned">Plump Cushion</option>
                          <option value="wood_plank">Solid Wood Timber</option>
                          <option value="curved_shell">Curved Shell</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Leg Base Style</label>
                        <select
                          value={chairLegStyle}
                          onChange={(e) => setChairLegStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="straight_4">Classic 4 Legs</option>
                          <option value="tapered_wood">Mid-Century Tapered</option>
                          <option value="metal_sled">Metal Sled Runner</option>
                          <option value="swivel_pedestal">Center Swivel Pedestal</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Sofa Archetype Controls */}
                  {archetype === 'sofa' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Seating Configuration</label>
                        <select
                          value={sofaType}
                          onChange={(e) => setSofaType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="straight_2_seater">2-Seater Loveseat</option>
                          <option value="straight_3_seater">3-Seater Family Sofa</option>
                          <option value="l_shape_left">L-Sectional (Left Chaise)</option>
                          <option value="l_shape_right">L-Sectional (Right Chaise)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Armrest Style</label>
                        <select
                          value={sofaArmStyle}
                          onChange={(e) => setSofaArmStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="track_arm">Modern Track Arm</option>
                          <option value="rolled_arm">Classic Rolled Arm</option>
                          <option value="armless">Armless Clean Profile</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cushion Style</label>
                        <select
                          value={sofaCushionStyle}
                          onChange={(e) => setSofaCushionStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="plump">Plump & Deep Cushioned</option>
                          <option value="tufted">Tufted Grid Pattern</option>
                          <option value="minimal">Minimal Flat Surface</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Cabinet Archetype Controls */}
                  {archetype === 'cabinet' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Column Sections ({cabinetColumns})
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="4"
                          value={cabinetColumns}
                          onChange={(e) => setCabinetColumns(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Shelf Rows ({cabinetRows})
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={cabinetRows}
                          onChange={(e) => setCabinetRows(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Storage Facade</label>
                        <select
                          value={cabinetDoorType}
                          onChange={(e) => setCabinetDoorType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="solid_doors">Solid Panel Doors</option>
                          <option value="open_shelf">Open Shelving</option>
                          <option value="glass_doors">Glass Display Doors</option>
                          <option value="drawers">Pull-Out Drawers</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cabinetHasLegs}
                            onChange={(e) => setCabinetHasLegs(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-700">Elevated Legs Base</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Bed Archetype Controls */}
                  {archetype === 'bed' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Headboard Design</label>
                        <select
                          value={bedHeadboardStyle}
                          onChange={(e) => setBedHeadboardStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="tufted">Luxury Tufted Headboard</option>
                          <option value="wood_slat">Vertical Wood Slats</option>
                          <option value="floating_panel">Floating Wide Panel</option>
                          <option value="wingback">Wingback Upholstered</option>
                          <option value="none">No Headboard (Minimal)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Frame Architecture</label>
                        <select
                          value={bedFrameStyle}
                          onChange={(e) => setBedFrameStyle(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="platform">Platform Low Base</option>
                          <option value="upholstered_box">Upholstered Box Spring</option>
                          <option value="canopy">Canopy 4-Post Frame</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bedHasNightstands}
                            onChange={(e) => setBedHasNightstands(e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300"
                          />
                          <span className="text-xs font-bold text-slate-700">Include Integrated Floating Nightstands</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Lamp Archetype Controls */}
                  {archetype === 'lamp' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Fixture Silhouette</label>
                        <select
                          value={lampType}
                          onChange={(e) => {
                          const val = e.target.value as any;
                          setLampType(val);
                          if (val === 'table_lamp') setPlacementSurface('tabletop');
                          else if (val.startsWith('pendant_')) setPlacementSurface('ceiling');
                          else setPlacementSurface('floor');
                        }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700"
                        >
                          <option value="pendant_dome">Pendant Dome Shade</option>
                          <option value="globe_orb">Spherical Glass Orb</option>
                          <option value="pendant_cone">Cone Flared Pendant</option>
                          <option value="floor_arc">Floor Standing Lamp</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Light Emission Warmth</label>
                        <input
                          type="color"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-full h-8 rounded-lg cursor-pointer border border-slate-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Luminance Power ({lightIntensity}x)
                        </label>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={lightIntensity}
                          onChange={(e) => setLightIntensity(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Import OBJ Mode */}
            {studioMode === 'import_obj' && (
              <div className="bg-indigo-50/50 border border-indigo-200/80 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Import Custom 3D Model File (.OBJ)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Select any 3D wavefront (<code className="font-mono text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">.obj</code>)
                  file directly from your local computer. It will be parsed instantly into 3D geometry and rendered in real-time.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".obj"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white/80 hover:bg-white rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center gap-2 shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {importedFileName ? `Uploaded: ${importedFileName}` : 'Click to Browse Local System .OBJ File'}
                    </span>
                    <span className="text-[10px] text-slate-500">Supports standard Wavefront 3D geometries</span>
                  </div>
                </div>

                {isImporting && (
                  <div className="text-center text-xs font-bold text-indigo-600 animate-pulse">
                    Parsing 3D Wavefront Geometry...
                  </div>
                )}
              </div>
            )}

            {/* 3. Dimensions (W x D x H) */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-sky-600" />
                  <span>Dimensions (cm)</span>
                </span>
                <span className="text-[10px] text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  {width} × {depth} × {height} cm
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Width (X)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(5, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono text-center font-bold focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Depth (Z)</label>
                  <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(Math.max(5, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono text-center font-bold focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Height (Y)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(5, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-mono text-center font-bold focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Materials, PBR & Finishes */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Palette className="w-4 h-4 text-sky-600" />
                <span>3D Materials, Textures & Finishes</span>
              </div>

              {/* Style Presets */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Click Material Schemes
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setStylePreset(preset.id);
                        setColor(preset.color);
                        setRoughness(preset.roughness);
                        setMetalness(preset.metalness);
                        setOpacity(preset.opacity);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        color === preset.color
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100 shadow-xs'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-[9px] font-bold text-slate-700 truncate w-full">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PBR Sliders */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                    <span>Gloss/Matte</span>
                    <span className="font-mono font-bold text-sky-700">{Math.round(roughness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={roughness}
                    onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                    <span>Metalness</span>
                    <span className="font-mono font-bold text-sky-700">{Math.round(metalness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={metalness}
                    onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                    <span>Opacity</span>
                    <span className="font-mono font-bold text-sky-700">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Custom Color Wheel */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Color Tint / Base Tone:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-center font-bold text-slate-700 uppercase outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live 3D WebGL Preview Column (5 cols) */}
          <div className="col-span-5 bg-slate-100 flex flex-col items-center justify-between p-4 relative overflow-hidden">
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>Live 3D Studio Preview</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200">
                Drag to Rotate • Scroll to Zoom
              </span>
            </div>

            {/* Three.js Canvas Mount */}
            <div
              ref={canvasMountRef}
              onMouseDown={handlePreviewMouseDown}
              onMouseMove={handlePreviewMouseMove}
              onMouseUp={handlePreviewMouseUp}
              onMouseLeave={handlePreviewMouseUp}
              onWheel={handlePreviewWheel}
              className="w-full h-84 my-auto cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 relative"
            />

            <div className="w-full bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 text-center shadow-xs z-10">
              <p className="text-xs font-bold text-slate-800 truncate">{name || 'Custom 3D Item'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {category} • {width}×{depth}×{height}cm • {Math.round(roughness * 100)}% Roughness
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlaceInScene}
              onChange={(e) => setAutoPlaceInScene(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">
              Automatically place & select in active 3D room upon saving
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>✨ Save & Load into 3D Items</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
