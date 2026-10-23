'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Sun,
  Rotate3d,
  Maximize2,
  Camera,
  AlertTriangle,
  User,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  Compass,
  MapPin,
  RotateCw,
  RotateCcw,
  Trash2,
  Copy,
  Move,
  Layers,
  Palette,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  Building2,
  Gamepad2,
  Volume2,
  VolumeX,
  Eye,
} from 'lucide-react';
import { HomePlan, FurnitureItem, Wall, Room, CatalogItem, VisitorCameraState } from '../types/plan';
import { isTabletopItem, autoAttachToTabletop } from '../services/tabletopAttachment';
import { loadObjModel } from '../services/objParser';
import { createSafeWebGLRenderer, safelyDisposeRenderer } from '../services/webglHelper';
import { loadGltfModel, getLocalModelBlob } from '../services/modelLoader';
import { buildSubPartMaterials, mapObjGroupToPartId } from '../services/partMaterials';
import { soundEngine } from '../services/soundEffects';
import { PubgGameHud } from './PubgGameHud';
import {
  buildTableMeshGroup,
  buildChairMeshGroup,
  buildSofaMeshGroup,
  buildCabinetMeshGroup,
  buildBedMeshGroup,
  buildLampMeshGroup,
  buildShelfMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildWallDesignMeshGroup,
  buildInteriorDecorMeshGroup,
  buildCustomPrimitivesMeshGroup,
  buildStairsMeshGroup,
  buildTvUnitMeshGroup,
  buildRadiatorMeshGroup,
  buildCookerMeshGroup,
  buildSanitaryMeshGroup,
  buildDeskMeshGroup,
  buildProceduralMeshGroup,
  buildApplianceMeshGroup,
  buildVehicleMeshGroup,
  buildGardenBotanicalMeshGroup,
} from '../services/proceduralFurniture';
import { getProceduralTexture } from '../services/pbrTextures';
import { RenderStudioModal, RenderSnapshotSettings } from './RenderStudioModal';

interface Viewport3DProps {
  plan: HomePlan;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdatePlan?: (plan: HomePlan) => void;
  isCustomerMode?: boolean;
  collidingItemIds?: Set<string>;
  activeFloor?: number;
  floorMode?: 'single' | 'sideBySide' | 'stacked';
  onFloorModeChange?: (mode: 'single' | 'sideBySide' | 'stacked') => void;
  onFloorChange?: (floor: number) => void;
  isSplitMode?: boolean;
  cameraModeProp?: 'aerial' | 'visitor';
  onCameraModeChangeProp?: (mode: 'aerial' | 'visitor') => void;
  targetRoomToFocus?: Room | null;
  toolModeProp?: 'select' | 'pan';
  onToolModeChangeProp?: (mode: 'select' | 'pan') => void;
  visitorCameraProp?: VisitorCameraState;
  onVisitorCameraChange?: (state: VisitorCameraState) => void;
  onUpgradePrompt?: (featureName: string) => void;
  isPro?: boolean;
  fitTrigger?: number;
}

const CM = 0.01;

function buildSmartArchetypeFallback(
  item: FurnitureItem,
  itemMat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const lowerName = (item.name || '').toLowerCase();
  const lowerCat = (item.category || '').toLowerCase();
  const lowerCatId = (item.catalogId || '').toLowerCase();

  try {
    // 1. Appliances: Washing Machine, Dryer, Refrigerator, AC, Microwave
    if (lowerName.includes('washer') || lowerName.includes('washing') || lowerName.includes('laundry')) {
      return buildApplianceMeshGroup('washing_machine', item.width, item.depth, item.height);
    }
    if (lowerName.includes('dryer')) {
      return buildApplianceMeshGroup('dryer', item.width, item.depth, item.height);
    }
    if (lowerName.includes('refrigerator') || lowerName.includes('fridge')) {
      return buildApplianceMeshGroup('refrigerator', item.width, item.depth, item.height);
    }
    if (lowerName.includes('air conditioner') || lowerName.includes('ac unit') || lowerName.includes('split ac')) {
      return buildApplianceMeshGroup('air_conditioner', item.width, item.depth, item.height);
    }
    if (lowerName.includes('microwave')) {
      return buildApplianceMeshGroup('microwave', item.width, item.depth, item.height);
    }

    // 2. TV Unit & Television
    if (lowerName.includes('tv') || lowerName.includes('television') || lowerCatId.includes('tv')) {
      return buildTvUnitMeshGroup(item.width, item.depth, item.height, itemMat, partMats);
    }

    // 3. Wall Radiators / Heaters
    if (lowerName.includes('radiator') || lowerName.includes('heater') || lowerCatId.includes('radiator')) {
      return buildRadiatorMeshGroup(item.width, item.depth, item.height);
    }

    // 4. Stoves / Ranges / Cookers
    if (lowerName.includes('cooker') || lowerName.includes('stove') || lowerName.includes('range') || lowerCatId.includes('cooker')) {
      return buildCookerMeshGroup(item.width, item.depth, item.height);
    }

    // 5. Sanitary Fixtures (Bath, Toilet, Sink)
    if (lowerName.includes('bath') && !lowerName.includes('mat')) {
      return buildSanitaryMeshGroup('bath', item.width, item.depth, item.height);
    }
    if (lowerName.includes('toilet') || lowerName.includes('bidet') || lowerName.includes('wc') || lowerCatId.includes('toilet')) {
      return buildSanitaryMeshGroup('toilet', item.width, item.depth, item.height);
    }
    if (lowerName.includes('sink') || lowerName.includes('washbasin') || lowerCatId.includes('washbasin')) {
      return buildSanitaryMeshGroup('sink', item.width, item.depth, item.height);
    }

    // 6. Curtains, Mirrors, Rugs & Wall Art
    if (lowerName.includes('curtain') || lowerName.includes('drape')) {
      return buildInteriorDecorMeshGroup({ type: 'curtains', width: item.width, depth: item.depth, height: item.height }, itemMat);
    }
    if (lowerName.includes('rug') || lowerName.includes('carpet') || lowerName.includes('mat')) {
      return buildInteriorDecorMeshGroup({ type: 'area_rug', width: item.width, depth: item.depth, height: item.height }, itemMat);
    }
    if (lowerName.includes('mirror')) {
      return buildInteriorDecorMeshGroup({ type: lowerName.includes('vanity') ? 'vanity_mirror' : 'arched_mirror', width: item.width, depth: item.depth, height: item.height }, itemMat);
    }
    // High-Fidelity Botanical & Garden Architecture
    if (lowerName.includes('palm')) {
      return buildGardenBotanicalMeshGroup({ type: 'palm', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('cypress') || lowerName.includes('pine') || lowerName.includes('conifer')) {
      return buildGardenBotanicalMeshGroup({ type: 'cypress', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('hedge')) {
      return buildGardenBotanicalMeshGroup({ type: 'hedge', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('topiary')) {
      return buildGardenBotanicalMeshGroup({ type: 'topiary', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('bush') || lowerName.includes('hydrangea') || lowerName.includes('rose') || lowerName.includes('lavender') || lowerName.includes('flower')) {
      return buildGardenBotanicalMeshGroup({ type: 'flowering_bush', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('fountain')) {
      return buildGardenBotanicalMeshGroup({ type: 'fountain', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('planter') || lowerName.includes('garden bed') || lowerName.includes('trough')) {
      return buildGardenBotanicalMeshGroup({ type: 'planter_box', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('snake plant')) {
      return buildGardenBotanicalMeshGroup({ type: 'potted_snake', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('fig')) {
      return buildGardenBotanicalMeshGroup({ type: 'potted_fig', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('willow')) {
      return buildGardenBotanicalMeshGroup({ type: 'weeping_willow', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('bamboo')) {
      return buildGardenBotanicalMeshGroup({ type: 'bamboo', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('bonsai')) {
      return buildGardenBotanicalMeshGroup({ type: 'bonsai', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('cactus') || lowerName.includes('saguaro') || lowerName.includes('succulent')) {
      return buildGardenBotanicalMeshGroup({ type: 'cactus', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('banana')) {
      return buildGardenBotanicalMeshGroup({ type: 'banana_palm', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('pergola') || lowerName.includes('gazebo') || lowerName.includes('arbor')) {
      return buildGardenBotanicalMeshGroup({ type: 'pergola', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('fire pit') || lowerName.includes('firepit') || lowerName.includes('fire bowl')) {
      return buildGardenBotanicalMeshGroup({ type: 'fire_pit', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('tree') || lowerName.includes('maple') || lowerName.includes('oak') || lowerName.includes('birch')) {
      return buildGardenBotanicalMeshGroup({ type: 'deciduous_tree', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('plant') || lowerCat.includes('plant') || lowerCat.includes('garden') || lowerCat.includes('outdoor')) {
      return buildGardenBotanicalMeshGroup({ type: 'potted_monstera', width: item.width, depth: item.depth, height: item.height }, itemMat, partMats);
    }
    if (lowerName.includes('painting') || lowerName.includes('canvas') || lowerName.includes('wall art')) {
      return buildInteriorDecorMeshGroup({ type: 'wall_art', width: item.width, depth: item.depth, height: item.height }, itemMat);
    }

    // 7. Desks
    if (lowerName.includes('desk') || lowerCatId.includes('desk')) {
      return buildDeskMeshGroup(item.width, item.depth, item.height, itemMat);
    }

    // 6. Chairs (Spindle slat back for dining chairs, cushioned wingback for armchairs)
    if (lowerName.includes('chair') || lowerName.includes('armchair') || lowerName.includes('stool') || lowerCatId.includes('chair')) {
      const isDining = lowerName.includes('dining') || (!lowerName.includes('armchair') && !lowerName.includes('lounge'));
      return buildChairMeshGroup(
        {
          seatType: 'cushioned',
          backrestStyle: lowerName.includes('armchair') ? 'wingback' : (isDining ? 'spindle_slats' : 'solid_panel'),
          legStyle: 'straight_4',
          width: item.width,
          depth: item.depth,
          height: item.height,
          seatHeight: Math.min(45, item.height * 0.5),
        },
        itemMat,
        partMats
      );
    }

    // 7. Sofas & Couches
    if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('lounge') || lowerCatId.includes('sofa')) {
      return buildSofaMeshGroup(
        {
          type: lowerName.includes('l-shape') || lowerName.includes('corner') ? 'l_shape_left' : 'straight_2_seater',
          cushionStyle: 'plump',
          armStyle: 'track_arm',
          legStyle: 'wooden_pegs',
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    // 8. Tables (Supporting oval, round, and rectangular dining tables)
    if (lowerName.includes('table') || lowerCatId.includes('table')) {
      const isOval = lowerName.includes('oval') || (lowerName.includes('round') && Math.abs(item.width - item.depth) >= 15);
      const isRound = lowerName.includes('round') && Math.abs(item.width - item.depth) < 15;
      return buildTableMeshGroup(
        {
          shape: isOval ? 'oval' : (isRound ? 'round' : 'rectangular'),
          legStyle: isRound ? 'pedestal_column' : '4_legs_corner',
          topThickness: 4,
          legThickness: 5,
          bevel: true,
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    // 9. Beds
    if (lowerName.includes('bed') || lowerCat === 'bedroom' || lowerCatId.includes('bed')) {
      return buildBedMeshGroup(
        {
          headboardStyle: 'tufted',
          frameStyle: 'platform',
          width: item.width,
          depth: item.depth,
          height: item.height,
          hasNightstands: false,
        },
        itemMat,
        partMats
      );
    }

    // 10. Cabinets & Storage
    if (lowerCat === 'kitchen' || lowerName.includes('cabinet') || lowerName.includes('wardrobe') || lowerCatId.includes('cabinet') || lowerName.includes('dresser') || lowerName.includes('pantry') || lowerName.includes('credenza')) {
      const isArched = lowerName.includes('arch') || lowerCatId.includes('arch');
      const isGlass = lowerName.includes('glass') || lowerCatId.includes('glass');
      const isNiche = lowerName.includes('niche') || lowerCatId.includes('niche');
      const isWall = item.elevation && item.elevation > 100 || lowerName.includes('wall') || lowerCatId.includes('wall');
      const isPantry = lowerName.includes('pantry') || item.height > 160;

      let doorType: 'open_shelf' | 'solid_doors' | 'glass_doors' | 'drawers' | 'arched_panel' | 'arched_glass' | 'arched_niche' = 'solid_doors';
      if (isArched) {
        doorType = isNiche ? 'arched_niche' : (isGlass ? 'arched_glass' : 'arched_panel');
      } else if (isGlass) {
        doorType = 'glass_doors';
      }

      return buildCabinetMeshGroup(
        {
          columns: item.width > 110 ? (item.width > 160 ? 3 : 2) : 1,
          rows: isPantry ? 4 : (isWall ? 2 : 2),
          doorType,
          width: item.width,
          depth: item.depth,
          height: item.height,
          hasLegs: !isWall && !isPantry && !lowerName.includes('base') && !lowerName.includes('island'),
          countertop: !isWall && !isPantry,
          underLighting: isWall,
          hasCrown: isPantry || isWall,
        },
        itemMat,
        partMats
      );
    }

    // 11. Lighting
    if (lowerCat === 'lighting' || lowerName.includes('lamp') || lowerCatId.includes('lamp')) {
      const isPendant = lowerName.includes('pendant') || lowerName.includes('hanging') || lowerName.includes('dome') || lowerName.includes('chandelier');
      return buildLampMeshGroup(
        {
          type: isPendant ? 'pendant_dome' : 'table_lamp',
          shadeWidth: item.width,
          shadeHeight: item.depth,
          totalHeight: item.height,
        },
        itemMat,
        partMats
      );
    }

    // 12. Doors & Windows
    if (lowerCat === 'doors & windows' || lowerName.includes('door') || lowerName.includes('window')) {
      if (lowerName.includes('window')) {
        return buildWindowMeshGroup(
          {
            type: 'modern_sliding',
            width: item.width,
            depth: item.depth,
            height: item.height,
          },
          itemMat
        );
      }
      return buildDoorMeshGroup(
        {
          type: lowerName.includes('french') ? 'glass_french' : (lowerName.includes('barn') ? 'barn_sliding' : 'modern_flush'),
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    // 13. Stairs
    if (lowerCat === 'stairs' || lowerName.includes('stair') || lowerCatId.includes('stair') || lowerName.includes('steps')) {
      let stairType: 'straight' | 'open_riser' | 'floating' | 'l_shape' | 'spiral' | 'outdoor_concrete' | 'outdoor_deck' | 'outdoor_metal' = 'straight';
      if (lowerName.includes('concrete') || lowerName.includes('stone') || lowerName.includes('entry step') || lowerName.includes('stoop')) {
        stairType = 'outdoor_concrete';
      } else if (lowerName.includes('deck') || lowerName.includes('porch') || lowerName.includes('timber') || lowerName.includes('patio')) {
        stairType = 'outdoor_deck';
      } else if (lowerName.includes('floating') || lowerName.includes('cantilever') || lowerName.includes('glass')) {
        stairType = 'floating';
      } else if (lowerName.includes('l-shape') || lowerName.includes('l_shape') || lowerName.includes('landing') || lowerName.includes('corner')) {
        stairType = 'l_shape';
      } else if (lowerName.includes('metal') || lowerName.includes('fire escape') || lowerName.includes('industrial')) {
        stairType = 'outdoor_metal';
      } else if (lowerName.includes('spiral') || lowerName.includes('helical') || lowerName.includes('curved')) {
        stairType = 'spiral';
      } else if (lowerName.includes('duplex') || lowerName.includes('open')) {
        stairType = 'open_riser';
      }

      return buildStairsMeshGroup(
        {
          type: stairType,
          width: item.width,
          depth: item.depth,
          height: item.height,
        },
        itemMat,
        partMats
      );
    }

    // 14. Vehicles & Automobiles (Sedan, SUV, Sports Car, EV, Pickup Truck, Scooter, Bicycle)
    if (lowerName.includes('bicycle') || lowerName.includes('bike') || lowerCatId.includes('bicycle') || lowerCatId.includes('bike')) {
      return buildVehicleMeshGroup({ type: 'bicycle', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerName.includes('vespa') || lowerName.includes('scooter') || lowerName.includes('moped')) {
      return buildVehicleMeshGroup({ type: 'vespa', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerName.includes('truck') || lowerName.includes('pickup')) {
      return buildVehicleMeshGroup({ type: 'truck', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerName.includes('suv') || lowerName.includes('jeep') || lowerName.includes('crossover')) {
      return buildVehicleMeshGroup({ type: 'suv', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerName.includes('sport') || lowerName.includes('coupe') || lowerName.includes('supercar') || lowerName.includes('gt')) {
      return buildVehicleMeshGroup({ type: 'sports', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerName.includes('ev') || lowerName.includes('electric') || lowerName.includes('tesla')) {
      return buildVehicleMeshGroup({ type: 'ev', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
    if (lowerCat.includes('vehicle') || lowerCat.includes('garage') || lowerName.includes('car') || lowerCatId.includes('car') || lowerName.includes('sedan') || lowerName.includes('vehicle')) {
      return buildVehicleMeshGroup({ type: 'sedan', width: item.width, depth: item.depth, height: item.height, color: item.color }, itemMat, partMats);
    }
  } catch (e) {}

  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(item.width * CM, item.height * CM, item.depth * CM);
  const mesh = new THREE.Mesh(geom, itemMat);
  mesh.position.y = (item.height * CM) / 2;
  grp.add(mesh);
  return grp;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  plan,
  selectedId,
  onSelectId,
  onUpdatePlan,
  isCustomerMode = false,
  collidingItemIds = new Set(),
  activeFloor = 0,
  floorMode,
  onFloorModeChange,
  onFloorChange,
  isSplitMode = false,
  cameraModeProp,
  onCameraModeChangeProp,
  targetRoomToFocus,
  toolModeProp,
  onToolModeChangeProp,
  visitorCameraProp,
  onVisitorCameraChange,
  onUpgradePrompt,
  isPro = true,
  fitTrigger,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshesGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  const planRef = useRef<HomePlan>(plan);
  planRef.current = plan;
  const onUpdatePlanRef = useRef(onUpdatePlan);
  onUpdatePlanRef.current = onUpdatePlan;
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  // 3D Pick and Drag Placement State
  const isDraggingObjectRef = useRef(false);
  const draggedItemIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const [isHoveringObject, setIsHoveringObject] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  hoveredIdRef.current = hoveredId;

  const pendingClickedItemRef = useRef<{
    id: string;
    type: 'furniture' | 'wall' | 'floorSign' | 'floorPad' | 'roomFloor';
    floorLevel?: number;
  } | null>(null);
  const canDragSelectedItemRef = useRef(false);
  const hasMovedPastThresholdRef = useRef(false);
  const [isDraggingObjectState, setIsDraggingObjectState] = useState(false);
  const [isDragOverCatalog, setIsDragOverCatalog] = useState(false);

  // 3D Tool Mode: 'select' (Select & Drag Furniture) | 'pan' (Free Hand Pan View without moving items)
  const [localToolMode, setLocalToolMode] = useState<'select' | 'pan'>('select');
  const toolMode = toolModeProp !== undefined ? toolModeProp : localToolMode;
  const setToolMode = (mode: 'select' | 'pan') => {
    setLocalToolMode(mode);
    if (onToolModeChangeProp) onToolModeChangeProp(mode);
  };
  const toolModeRef = useRef<'select' | 'pan'>('select');
  toolModeRef.current = toolMode;

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSpacePressedRef = useRef(false);
  const [isPanningState, setIsPanningState] = useState(false);


  // 3D Floor Isolation & Multi-Floor Mode: 'isolated' (Focus Active Floor) | 'stacked' (All Floors) | 'sideBySide' (All Floors Side-by-Side)
  const [localFloor3DMode, setLocalFloor3DMode] = useState<'isolated' | 'stacked' | 'sideBySide'>('isolated');
  const floor3DMode: 'isolated' | 'stacked' | 'sideBySide' =
    floorMode === 'single' ? 'isolated' : (floorMode === 'sideBySide' ? 'sideBySide' : (floorMode === 'stacked' ? 'stacked' : localFloor3DMode));
  const setFloor3DMode = (newMode: 'isolated' | 'stacked' | 'sideBySide') => {
    setLocalFloor3DMode(newMode);
    if (onFloorModeChange) {
      onFloorModeChange(newMode === 'isolated' ? 'single' : newMode);
    }
  };

  // Next Floor Attachment Gap in Stacked/Duplex mode: 0 = attached flush, >0 = exploded gap (e.g. 0.8m, 1.6m)
  const [nextFloorGap, setNextFloorGap] = useState<number>(0);
  const nextFloorGapRef = useRef(nextFloorGap);
  nextFloorGapRef.current = nextFloorGap;

  // Camera Mode: 'aerial' (orbit) or 'visitor' (human eye level walkthrough at 160cm)
  const [localCameraMode, setLocalCameraMode] = useState<'aerial' | 'visitor'>(
    cameraModeProp || (isCustomerMode ? 'visitor' : 'aerial')
  );
  const cameraMode = cameraModeProp !== undefined ? cameraModeProp : localCameraMode;
  const setCameraMode = (m: 'aerial' | 'visitor') => {
    setLocalCameraMode(m);
    if (m === 'visitor') {
      onSelectId(null);
    }
    if (onCameraModeChangeProp) onCameraModeChangeProp(m);
  };

  // Top View / Ceiling Toggle: false = removed top (interior cutaway view), true = keep top (enclosed ceiling)
  const [showCeiling, setShowCeiling] = useState<boolean>(false);
  const [hasWebglError, setHasWebglError] = useState<boolean>(false);
  // Sync external 2D visitor camera position into 3D
  useEffect(() => {
    if (visitorCameraProp && cameraMode === 'visitor') {
      const newX = (visitorCameraProp.x || 0) * 0.01;
      const newZ = (visitorCameraProp.y || 0) * 0.01;
      if (
        Math.abs(newX - visitorPosRef.current.x) > 0.03 ||
        Math.abs(newZ - visitorPosRef.current.z) > 0.03
      ) {
        visitorPosRef.current.x = newX;
        visitorPosRef.current.z = newZ;
      }
      if (visitorCameraProp.yaw !== undefined && Math.abs(visitorCameraProp.yaw - visitorYawRef.current) > 0.03) {
        visitorYawRef.current = visitorCameraProp.yaw;
      }
      if (visitorCameraProp.floorLevel !== undefined && visitorCameraProp.floorLevel !== activeFloorRef.current && onFloorChange) {
        onFloorChange(visitorCameraProp.floorLevel);
      }
    }
  }, [visitorCameraProp, cameraMode, onFloorChange]);

  const cameraModeRef = useRef<'aerial' | 'visitor'>('aerial');
  cameraModeRef.current = cameraMode;

  useEffect(() => {
    if (cameraMode === 'visitor') {
      onSelectId(null);
    }
  }, [cameraMode]);

  const [timeOfDay, setTimeOfDay] = useState<number>(plan.environment?.timeOfDay || 14.5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRenderStudioOpen, setIsRenderStudioOpen] = useState(false);
  const [walkWarning, setWalkWarning] = useState<string | null>(null);
  const walkWarningRef = useRef<string | null>(null);
  walkWarningRef.current = walkWarning;
  const walkWarningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerWalkWarning = (msg: string) => {
    setWalkWarning(msg);
    if (walkWarningTimerRef.current) clearTimeout(walkWarningTimerRef.current);
    walkWarningTimerRef.current = setTimeout(() => {
      setWalkWarning(null);
    }, 2800);
  };

  // Aerial Orbit State
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetRef = useRef(new THREE.Vector3(0, 1.0, 0));

  // Floor Mode and Active Floor Refs
  const floor3DModeRef = useRef(floor3DMode);
  floor3DModeRef.current = floor3DMode;

  const activeFloorRef = useRef(activeFloor);
  activeFloorRef.current = activeFloor;

  const getFloor3DOffset = (level: number = 0, currentFloorMode = floor3DModeRef.current) => {
    const allFloors = planRef.current.floors && planRef.current.floors.length > 0 ? planRef.current.floors : [
      { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
      { level: 1, name: '1st Floor', height: 250, elevation: 250 },
    ];
    if (currentFloorMode === 'isolated') {
      return { x: 0, y: 0, z: 0 };
    } else if (currentFloorMode === 'sideBySide') {
      const floorIdx = allFloors.findIndex((fl) => fl.level === level);
      const validIdx = floorIdx >= 0 ? floorIdx : 0;
      const mid = (allFloors.length - 1) / 2;
      return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
    } else {
      const baseH = 2.5;
      const gap = nextFloorGapRef.current || 0;
      return { x: 0, y: level * (baseH + gap), z: 0 };
    }
  };

  // Virtual Visitor State (Human eye level 1.6m above active floor)
  const visitorPosRef = useRef(new THREE.Vector3(0, 1.6, 0));
  const visitorYawRef = useRef(0);
  const lastSentPosRef = useRef<{ x: number; y: number; yaw: number }>({ x: 0, y: 0, yaw: 0 });
  const visitorPitchRef = useRef(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // PUBG Game Tour State (First-Person Game Walkthrough, kinematics, procedural audio, drag-look directions)
  const [isDraggingLookState, setIsDraggingLookState] = useState(false);

  const [isCrouching, setIsCrouching] = useState(false);
  const isCrouchingRef = useRef(false);
  isCrouchingRef.current = isCrouching;

  const [isSprintingState, setIsSprintingState] = useState(false);
  const [isMovingState, setIsMovingState] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const [nearbyDoorPrompt, setNearbyDoorPrompt] = useState<{ name: string; isOpen: boolean } | null>(null);
  const [hudYaw, setHudYaw] = useState(0);
  const [hudPitch, setHudPitch] = useState(0);

  const visitorVerticalVelocityRef = useRef(0);
  const visitorJumpOffsetRef = useRef(0);
  const visitorGroundYRef = useRef(0);

  // Initialize Three.js WebGL Scene ONCE
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#eef5fb');
    scene.fog = new THREE.FogExp2('#eef5fb', 0.007);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.02, 1000);
    cameraRef.current = camera;

    const renderer = createSafeWebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });

    if (!renderer) {
      console.warn('Could not initialize WebGL context in Viewport3D.');
      setHasWebglError(true);
      return;
    }
    setHasWebglError(false);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    // Photorealistic PBR Image-Based Lighting & Environmental Reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envScene = new RoomEnvironment();
      const envMap = pmremGenerator.fromScene(envScene, 0.04);
      scene.environment = envMap.texture;
    } catch (envErr) {
      console.warn('Could not compile PMREM env map:', envErr);
    }

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xe2f1fc, 0x829ab1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Architectural Warm Interior Bounce Fill (simulates light bouncing off floors into ceilings)
    const bounceLight = new THREE.DirectionalLight(0xffeedb, 0.45);
    bounceLight.position.set(-15, 20, -15);
    scene.add(bounceLight);

    const dirLight = new THREE.DirectionalLight(0xfff8eb, 1.6);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.radius = 2.8; // Soft diffused natural sun penumbra
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const groundGeom = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x487922,
      roughness: 0.95,
      metalness: 0.01,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(60, 60, 0x3d661e, 0x55882b);
    gridHelper.position.y = 0.001;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.opacity = 0.35;
      gridHelper.material.transparent = true;
    }
    scene.add(gridHelper);
    scene.add(gridHelper);

    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);
    meshesGroupRef.current = meshesGroup;

    // Keyboard handlers for WASD Virtual Visitor navigation & selected furniture manipulation
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input/textarea, ignore
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Spacebar: in visitor mode -> Jump; in aerial mode -> Free Hand Pan
      if (e.code === 'Space' && !e.repeat) {
        if (cameraModeRef.current === 'visitor') {
          e.preventDefault();
          if (visitorJumpOffsetRef.current === 0) {
            visitorVerticalVelocityRef.current = 4.2; // PUBG jump impulse
          }
        } else {
          isSpacePressedRef.current = true;
          setIsSpacePressed(true);
        }
      }
      // 'H' key toggles Free Hand tool
      if (e.code === 'KeyH') {
        const next = toolModeRef.current === 'pan' ? 'select' : 'pan';
        toolModeRef.current = next;
        setToolMode(next);
      }
      // 'V' key returns to Select tool
      if (e.code === 'KeyV') {
        toolModeRef.current = 'select';
        setToolMode('select');
      }
      // 'C' key: in visitor mode -> toggle crouch
      if (e.code === 'KeyC' && cameraModeRef.current === 'visitor') {
        e.preventDefault();
        setIsCrouching((prev) => !prev);
      }
      // 'M' key: in visitor mode -> toggle footsteps audio
      if (e.code === 'KeyM' && cameraModeRef.current === 'visitor') {
        e.preventDefault();
        setIsSoundEnabled(soundEngine.toggle());
      }
      // 'F' key: in visitor mode -> interact with closest door or window
      if (e.code === 'KeyF' && cameraModeRef.current === 'visitor') {
        e.preventDefault();
        const vp = visitorPosRef.current;
        let nearestDoorPart: any = null;
        let minD = 2.4;
        const wPos = new THREE.Vector3();
        meshesGroup.traverse((obj) => {
          if (obj.userData && obj.userData.isInteractive) {
            obj.getWorldPosition(wPos);
            const d = Math.hypot(vp.x - wPos.x, vp.z - wPos.z);
            if (d < minD) {
              minD = d;
              nearestDoorPart = obj;
            }
          }
        });
        if (nearestDoorPart) {
          nearestDoorPart.userData.isOpenManually = !nearestDoorPart.userData.isOpenManually;
          soundEngine.playDoor(nearestDoorPart.userData.isOpenManually);
        }
      }
      // Escape returns to Select tool
      if (e.code === 'Escape') {
        toolModeRef.current = 'select';
        setToolMode('select');
      }

      keysPressedRef.current[e.code] = true;

      const selId = selectedIdRef.current;
      const currentPlan = planRef.current;
      const updatePlan = onUpdatePlanRef.current;

      if (selId && updatePlan) {
        const item = currentPlan.furniture.find((f) => f.id === selId);
        if (item) {
          // 'R' -> Rotate 45 deg
          if (e.code === 'KeyR') {
            e.preventDefault();
            const angleDelta = e.shiftKey ? -Math.PI / 4 : Math.PI / 4;
            const newAngle = ((item.angle || 0) + angleDelta + Math.PI * 2) % (Math.PI * 2);
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId ? { ...f, angle: newAngle } : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // '+' or '=' -> Scale Up 10%
          if (e.code === 'Equal' || e.code === 'NumpadAdd') {
            e.preventDefault();
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId
                  ? {
                      ...f,
                      width: Math.round(f.width * 1.1),
                      depth: Math.round(f.depth * 1.1),
                      height: Math.round(f.height * 1.1),
                    }
                  : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // '-' or '_' -> Scale Down 10%
          if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
            e.preventDefault();
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.map((f) =>
                f.id === selId
                  ? {
                      ...f,
                      width: Math.max(10, Math.round(f.width * 0.9)),
                      depth: Math.max(10, Math.round(f.depth * 0.9)),
                      height: Math.max(10, Math.round(f.height * 0.9)),
                    }
                  : f
              ),
              updatedAt: new Date().toISOString(),
            });
          }

          // 'Delete' or 'Backspace' -> Remove item
          if (e.code === 'Delete' || e.code === 'Backspace') {
            e.preventDefault();
            if (item.isLocked) {
              alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
              return;
            }
            updatePlan({
              ...currentPlan,
              furniture: currentPlan.furniture.filter((f) => f.id !== selId),
              updatedAt: new Date().toISOString(),
            });
            onSelectId(null);
          }

          // Arrow Keys in Aerial Mode -> Nudge item
          if (cameraModeRef.current === 'aerial') {
            const NUDGE = e.shiftKey ? 50 : 10; // cm
            let dx = 0;
            let dy = 0;
            if (e.code === 'ArrowUp') dy = -NUDGE;
            if (e.code === 'ArrowDown') dy = NUDGE;
            if (e.code === 'ArrowLeft') dx = -NUDGE;
            if (e.code === 'ArrowRight') dx = NUDGE;

            if (dx !== 0 || dy !== 0) {
              e.preventDefault();
              updatePlan({
                ...currentPlan,
                furniture: currentPlan.furniture.map((f) =>
                  f.id === selId ? { ...f, x: f.x + dx, y: f.y + dy } : f
                ),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Continuous Animation & Camera Update Loop
    let animationId: number;
    let clock = new THREE.Clock();

    // Initial visitor position setup from room center
    const initialTargetRoom = planRef.current.rooms.find((r) => (r.floorLevel ?? 0) === (activeFloor ?? 0)) || planRef.current.rooms[0];
    if (initialTargetRoom && initialTargetRoom.points.length > 0) {
      const avgX = (initialTargetRoom.points.reduce((acc, p) => acc + p.x, 0) / initialTargetRoom.points.length) * 0.01;
      const avgZ = (initialTargetRoom.points.reduce((acc, p) => acc + p.y, 0) / initialTargetRoom.points.length) * 0.01;
      visitorPosRef.current.set(avgX, 1.6, avgZ);
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const mode = cameraModeRef.current;

      if (mode === 'visitor') {
        // Continuous keyboard movement in PUBG Game Walkthrough mode
        const isShift = Boolean(keysPressedRef.current['ShiftLeft'] || keysPressedRef.current['ShiftRight']);
        const isCrouched = Boolean(isCrouchingRef.current);
        const baseSpeed = isCrouched ? 1.6 : isShift ? 5.6 : 2.8; // m/s (Crouch sneak vs Sprint vs Walk)
        const moveDist = baseSpeed * delta;

        let moveForward = 0;
        let moveRight = 0;

        if (keysPressedRef.current['KeyW'] || keysPressedRef.current['ArrowUp']) moveForward += 1;
        if (keysPressedRef.current['KeyS'] || keysPressedRef.current['ArrowDown']) moveForward -= 1;
        if (keysPressedRef.current['KeyA']) moveRight -= 1;
        if (keysPressedRef.current['KeyD']) moveRight += 1;

        // Smooth keyboard turn keys (ArrowLeft / ArrowRight / Q / E)
        if (keysPressedRef.current['ArrowLeft'] || keysPressedRef.current['KeyQ']) {
          visitorYawRef.current += 2.0 * delta;
        }
        if (keysPressedRef.current['ArrowRight'] || keysPressedRef.current['KeyE']) {
          visitorYawRef.current -= 2.0 * delta;
        }

        const isCurrentlyMoving = moveForward !== 0 || moveRight !== 0;
        const isCurrentlySprinting = isCurrentlyMoving && isShift && !isCrouched;

        // Camera horizontal vectors
        const forward = new THREE.Vector3(
          Math.sin(visitorYawRef.current),
          0,
          -Math.cos(visitorYawRef.current)
        );
        const right = new THREE.Vector3(
          Math.cos(visitorYawRef.current),
          0,
          Math.sin(visitorYawRef.current)
        );

        // Desired velocity vector
        const moveVec = new THREE.Vector3();
        if (moveForward !== 0) moveVec.addScaledVector(forward, moveForward);
        if (moveRight !== 0) moveVec.addScaledVector(right, moveRight);
        if (moveVec.lengthSq() > 0) moveVec.normalize();

        const moveYaw = moveVec.lengthSq() > 0
          ? Math.atan2(moveVec.x, -moveVec.z)
          : visitorYawRef.current;

        // Proposed candidate position
        let nextX = visitorPosRef.current.x + moveVec.x * moveDist;
        let nextZ = visitorPosRef.current.z + moveVec.z * moveDist;

        // ----------------------------------------------------
        // ----------------------------------------------------
        // WALL COLLISION & DOOR-ONLY ENTRY PHYSICS
        // ----------------------------------------------------
        const curLevel = activeFloorRef.current ?? 0;
        const currentWalls = planRef.current.walls.filter((w) => (w.floorLevel ?? 0) === curLevel);

        // Strict door detection (strictly doors, completely excluding windows!)
        const isDoor = (f: FurnitureItem) => {
          const n = (f.name || '').toLowerCase();
          const c = (f.catalogId || '').toLowerCase();
          const m = (f.model || '').toLowerCase();
          return (n.includes('door') || c.includes('door') || m.includes('procedural:door')) && !n.includes('window') && !c.includes('window');
        };

        const doorsOnFloor = planRef.current.furniture.filter(
          (f) => (f.floorLevel ?? 0) === curLevel && isDoor(f)
        );

        // Check if an interactive door is currently open
        const isDoorOpen = (doorItem: FurnitureItem) => {
          let open = false;
          meshesGroup.traverse((obj) => {
            if (obj.userData && obj.userData.id === doorItem.id && Array.isArray(obj.userData.animParts)) {
              obj.userData.animParts.forEach((part: THREE.Object3D) => {
                if (part.userData && (part.userData.currentProgress > 0.35 || part.userData.targetProgress > 0.5)) {
                  open = true;
                }
              });
            }
          });
          return open;
        };

        const playerRadius = 0.28; // 28cm player collision capsule

        for (const wall of currentWalls) {
          const wX1 = wall.xStart * 0.01;
          const wZ1 = wall.yStart * 0.01;
          const wX2 = wall.xEnd * 0.01;
          const wZ2 = wall.yEnd * 0.01;

          const segX = wX2 - wX1;
          const segZ = wZ2 - wZ1;
          const segLenSq = segX * segX + segZ * segZ;
          if (segLenSq < 0.0001) continue;

          const t = Math.max(0, Math.min(1, ((nextX - wX1) * segX + (nextZ - wZ1) * segZ) / segLenSq));
          const closestX = wX1 + t * segX;
          const closestZ = wZ1 + t * segZ;

          const distX = nextX - closestX;
          const distZ = nextZ - closestZ;
          const dist = Math.hypot(distX, distZ);

          if (dist < playerRadius) {
            // "entry only with doors": check if contact point aligns with an actual door AND that door is open
            const passingDoor = doorsOnFloor.find((d) => {
              const dX = d.x * 0.01;
              const dZ = d.y * 0.01;
              const doorWidthM = (d.width || 90) * 0.01;
              return Math.hypot(closestX - dX, closestZ - dZ) < (doorWidthM * 0.55);
            });

            const canPassThrough = passingDoor && isDoorOpen(passingDoor);

            if (!canPassThrough) {
              const overlap = playerRadius - dist;
              const nx = dist > 0.0001 ? distX / dist : 1;
              const nz = dist > 0.0001 ? distZ / dist : 0;
              nextX += nx * overlap;
              nextZ += nz * overlap;
            }
          }
        }

        // Clamp inside architectural parcel boundary
        nextX = Math.max(-6.5, Math.min(6.5, nextX));
        nextZ = Math.max(-5.0, Math.min(5.0, nextZ));

        visitorPosRef.current.x = nextX;
        visitorPosRef.current.z = nextZ;

        // ----------------------------------------------------
        // DUPLEX STAIRCASE CLIMBING & ELEVATION PHYSICS
        // ----------------------------------------------------
        const baseOffset = getFloor3DOffset(curLevel);
        let targetGroundY = baseOffset.y;

        const allStairs = planRef.current.furniture.filter(
          (f) =>
            f.catalogId.toLowerCase().includes('stair') ||
            f.name.toLowerCase().includes('stair') ||
            f.category?.toLowerCase().includes('stair') ||
            f.model?.includes('procedural:stairs')
        );

        for (const st of allStairs) {
          if ((st.height || 0) < 160) continue; // Skip small entry stoops

          const sw = (st.width || 100) * 0.01;
          const sd = (st.depth || 240) * 0.01;
          const sMinX = st.x * 0.01 - sw / 2;
          const sMaxX = st.x * 0.01 + sw / 2;
          const sMinZ = st.y * 0.01 - sd / 2;
          const sMaxZ = st.y * 0.01 + sd / 2;

          if (
            nextX >= sMinX - 0.25 &&
            nextX <= sMaxX + 0.25 &&
            nextZ >= sMinZ - 0.25 &&
            nextZ <= sMaxZ + 0.25
          ) {
            // Progress from bottom to top along stair flight
            const stairProgress = Math.max(0, Math.min(1, (nextZ - sMinZ) / Math.max(0.1, sMaxZ - sMinZ)));
            const floorHeightGap = 2.5 + (nextFloorGapRef.current || 0);
            targetGroundY = stairProgress * floorHeightGap;

            // Automatically switch active floor level when reaching upper mezzanine or ground floor
            if (stairProgress >= 0.82 && activeFloorRef.current !== 1) {
              activeFloorRef.current = 1;
              if (onFloorChange) onFloorChange(1);
            } else if (stairProgress <= 0.18 && activeFloorRef.current !== 0) {
              activeFloorRef.current = 0;
              if (onFloorChange) onFloorChange(0);
            }
            break;
          }
        }

        // Smooth elevation spring
        visitorGroundYRef.current = THREE.MathUtils.lerp(
          visitorGroundYRef.current,
          targetGroundY,
          Math.min(1.0, delta * 12.0)
        );

        // Jump physics with gravity
        if (visitorJumpOffsetRef.current > 0 || visitorVerticalVelocityRef.current > 0) {
          visitorVerticalVelocityRef.current -= 14.0 * delta;
          visitorJumpOffsetRef.current += visitorVerticalVelocityRef.current * delta;
          if (visitorJumpOffsetRef.current <= 0) {
            visitorJumpOffsetRef.current = 0;
            visitorVerticalVelocityRef.current = 0;
          }
        }

        // Procedural footstep audio
        if (isCurrentlyMoving && visitorJumpOffsetRef.current === 0) {
          soundEngine.playFootstep(isCurrentlySprinting, isCrouched);
        }

        const totalPlayerY = visitorGroundYRef.current + visitorJumpOffsetRef.current;
        const vp = visitorPosRef.current;

        // ----------------------------------------------------
        // FIRST-PERSON IMMERSIVE GAME CAMERA (No human body, 100% clean unobstructed view)
        // ----------------------------------------------------
        const eyeH = isCrouched ? 1.1 : 1.65;
        const headBob = isCurrentlyMoving
          ? Math.sin(clock.getElapsedTime() * (isCurrentlySprinting ? 14 : 9)) * (isCurrentlySprinting ? 0.03 : 0.015)
          : 0;

        camera.position.set(vp.x, totalPlayerY + eyeH + headBob, vp.z);

        const lookDir = new THREE.Vector3(
          Math.sin(visitorYawRef.current) * Math.cos(visitorPitchRef.current),
          Math.sin(visitorPitchRef.current),
          -Math.cos(visitorYawRef.current) * Math.cos(visitorPitchRef.current)
        );
        camera.lookAt(camera.position.clone().add(lookDir));

        // Dynamic Sprint FOV
        const targetFov = isCurrentlySprinting ? 63 : 55;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 7);
        camera.updateProjectionMatrix();

        // Update HUD Compass & Pitch State
        setHudYaw(visitorYawRef.current);
        setHudPitch(visitorPitchRef.current);
        setIsMovingState(isCurrentlyMoving);
        setIsSprintingState(isCurrentlySprinting);

        // Real-time synchronization to 2D Floorplan view
        if (onVisitorCameraChange) {
          const cmX = Math.round(vp.x * 100);
          const cmY = Math.round(vp.z * 100);
          const curYaw = visitorYawRef.current;
          if (
            Math.abs(cmX - lastSentPosRef.current.x) >= 1 ||
            Math.abs(cmY - lastSentPosRef.current.y) >= 1 ||
            Math.abs(curYaw - lastSentPosRef.current.yaw) >= 0.015
          ) {
            lastSentPosRef.current = { x: cmX, y: cmY, yaw: curYaw };
            onVisitorCameraChange({
              x: cmX,
              y: cmY,
              yaw: curYaw,
              elevation: 160,
              floorLevel: curLevel,
            });
          }
        }
      } else {
        // Apply Aerial Orbit Camera Position
        const s = sphericalRef.current;
        const x = targetRef.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        const y = targetRef.current.y + s.radius * Math.cos(s.phi);
        const z = targetRef.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
        camera.position.set(x, y, z);
        camera.lookAt(targetRef.current);
      }

      // ----------------------------------------------------
      // PROXIMITY DOOR & WINDOW ANIMATION ENGINE
      // ----------------------------------------------------
      const isVisitorMode = mode === 'visitor';
      const camPos = camera.position;
      const worldPosVec = new THREE.Vector3();
      let closestInteractiveDoor: { name: string; isOpen: boolean } | null = null;
      let minInteractiveDist = 2.4;

      meshesGroup.traverse((obj) => {
        if (obj.userData && obj.userData.isInteractive && Array.isArray(obj.userData.animParts)) {
          obj.getWorldPosition(worldPosVec);
          const dist = Math.hypot(camPos.x - worldPosVec.x, camPos.z - worldPosVec.z);
          // Trigger when camera is within 2.3 meters in Virtual Tour mode OR clicked directly to open
          const shouldBeOpen = (isVisitorMode && dist < 2.3) || Boolean(obj.userData.isOpenManually);

          if (isVisitorMode && dist < minInteractiveDist) {
            minInteractiveDist = dist;
            closestInteractiveDoor = {
              name: obj.userData.name || 'Door',
              isOpen: shouldBeOpen,
            };
          }

          obj.userData.animParts.forEach((part: THREE.Object3D) => {
            if (part && part.userData) {
              part.userData.targetProgress = shouldBeOpen ? 1.0 : 0.0;

              const cur = part.userData.currentProgress || 0;
              const tgt = part.userData.targetProgress;
              const step = Math.min(1.0, delta * 5.0); // Smooth 60fps spring interpolation
              const next = cur + (tgt - cur) * step;
              part.userData.currentProgress = next;

              if (
                part.userData.animType === 'hinge_single' ||
                part.userData.animType === 'hinge_left' ||
                part.userData.animType === 'hinge_right'
              ) {
                part.rotation.y = part.userData.openRotation * next;
              } else if (part.userData.animType === 'slide_x') {
                part.position.x = part.userData.slideDist * next;
              }
            }
          });
        }
      });

      if (isVisitorMode) {
        setNearbyDoorPrompt(closestInteractiveDoor);
      }

      // Pulse animation for colliding items
      const elapsedTime = clock.getElapsedTime();
      meshesGroup.traverse((child) => {
        if (child.userData && child.userData.isColliding && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 6) * 0.4;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      safelyDisposeRenderer(renderer, mount);
    };
  }, []);

  // Synchronize visitor position when switching activeFloor
  useEffect(() => {
    // If external visitorCamera already has a position on this activeFloor, preserve it
    if (visitorCameraProp && (visitorCameraProp.floorLevel === activeFloor || visitorCameraProp.floorLevel === undefined)) {
      const curX = (visitorCameraProp.x || 0) * 0.01;
      const curZ = (visitorCameraProp.y || 0) * 0.01;
      visitorPosRef.current.set(curX, 1.6, curZ);
      return;
    }

    const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === (activeFloor ?? 0)) || plan.rooms[0];
    let initX = 0;
    let initZ = 0;
    if (targetRoom && targetRoom.points.length > 0) {
      initX = (targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length) * 0.01;
      initZ = (targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length) * 0.01;
    }
    visitorPosRef.current.set(initX, 1.6, initZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
    lastSentPosRef.current = { x: Math.round(initX * 100), y: Math.round(initZ * 100), yaw: 0 };

    if (onVisitorCameraChange) {
      onVisitorCameraChange({
        x: Math.round(initX * 100),
        y: Math.round(initZ * 100),
        yaw: 0,
        elevation: 160,
        floorLevel: activeFloor,
      });
    }
  }, [activeFloor]);

  // Update Sunlight & Atmospheric Sky based on Time of Day
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;

    const sunAngle = ((timeOfDay - 6) / 18) * Math.PI;
    const isDay = timeOfDay >= 5.5 && timeOfDay <= 19.5;

    if (isDay) {
      const sunY = Math.max(0.1, Math.sin(sunAngle) * 35);
      const sunX = Math.cos(sunAngle) * 35;
      dirLightRef.current.position.set(sunX, sunY, 15);

      if (timeOfDay < 8) {
        // Dawn / Early Morning: soft peach-rose sunrise
        dirLightRef.current.color.setHex(0xffaa77);
        dirLightRef.current.intensity = 1.3;
        hemiLightRef.current.color.setHex(0xffedd5);
        hemiLightRef.current.groundColor.setHex(0x64748b);
        hemiLightRef.current.intensity = 0.75;
        sceneRef.current.background = new THREE.Color('#fed7aa');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#fed7aa');
      } else if (timeOfDay > 17) {
        // Golden Hour / Sunset: rich golden amber light
        dirLightRef.current.color.setHex(0xf59e0b);
        dirLightRef.current.intensity = 1.4;
        hemiLightRef.current.color.setHex(0xfef3c7);
        hemiLightRef.current.groundColor.setHex(0x475569);
        hemiLightRef.current.intensity = 0.8;
        sceneRef.current.background = new THREE.Color('#fdba74');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#fdba74');
      } else {
        // High Noon / Daylight: crisp natural sun
        dirLightRef.current.color.setHex(0xffffff);
        dirLightRef.current.intensity = 1.75;
        hemiLightRef.current.color.setHex(0xffffff);
        hemiLightRef.current.groundColor.setHex(0x94a3b8);
        hemiLightRef.current.intensity = 0.9;
        sceneRef.current.background = new THREE.Color('#e2e8f0');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#e2e8f0');
      }
    } else {
      // Night / Twilight: cool deep midnight blue moonlight
      dirLightRef.current.position.set(-15, 25, -15);
      dirLightRef.current.color.setHex(0x60a5fa);
      dirLightRef.current.intensity = 0.45;
      hemiLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.35;
      sceneRef.current.background = new THREE.Color('#030712');
      if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color.set('#030712');
    }
  }, [timeOfDay]);

  // Build & Update 3D Meshes from Plan (with COLLISION RED GLOW)
  useEffect(() => {
    const group = meshesGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const CM = 0.01;
    const targetFloor = activeFloor ?? 0;

    const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
      { level: 0, name: 'Ground Floor', height: 250, elevation: 0 },
      { level: 1, name: '1st Floor', height: 250, elevation: 250 },
    ];

    // Helper for 3D floor placement: side-by-side horizontal positioning or stacked
    const getFloor3DOffset = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return { x: 0, y: 0, z: 0 };
      } else if (floor3DMode === 'sideBySide') {
        const floorIdx = allFloors.findIndex((fl) => fl.level === level);
        const validIdx = floorIdx >= 0 ? floorIdx : 0;
        const mid = (allFloors.length - 1) / 2;
        // 13.0 meters horizontal spacing side-by-side on ground level
        return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
      } else {
        // Stacked vertically: default elevation 2.5m + adjustable next-floor gap
        const baseH = 2.5;
        const gap = nextFloorGap || 0;
        return { x: 0, y: level * (baseH + gap), z: 0 };
      }
    };

    const isFloorVisible = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return level === targetFloor;
      }
      return true;
    };

    // 0. Build Foundation Plates & Clear Floor Title Placards in 3D
    allFloors.forEach((fl) => {
      if (!isFloorVisible(fl.level)) return;
      const offset = getFloor3DOffset(fl.level);
      const floorRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === fl.level);
      const floorWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === fl.level);

      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      floorRooms.forEach((r) => {
        r.points.forEach((p) => {
          minX = Math.min(minX, p.x * CM);
          maxX = Math.max(maxX, p.x * CM);
          minZ = Math.min(minZ, p.y * CM);
          maxZ = Math.max(maxZ, p.y * CM);
        });
      });
      floorWalls.forEach((w) => {
        minX = Math.min(minX, w.xStart * CM, w.xEnd * CM);
        maxX = Math.max(maxX, w.xStart * CM, w.xEnd * CM);
        minZ = Math.min(minZ, w.yStart * CM, w.yEnd * CM);
        maxZ = Math.max(maxZ, w.yStart * CM, w.yEnd * CM);
      });

      if (minX === Infinity) {
        minX = -3.5; maxX = 3.5; minZ = -3.5; maxZ = 3.5;
      }

      const padW = Math.max(7, (maxX - minX) + 2.0);
      const padD = Math.max(7, (maxZ - minZ) + 2.0);
      const centerX = (minX + maxX) / 2 + offset.x;
      const centerZ = (minZ + maxZ) / 2 + offset.z;

      // Base Ground Foundation Slab or Inter-Floor Slab with Architectural Stairwell Cutouts
      let padGeom: THREE.BufferGeometry;
      const stairsBelowFloor = plan.furniture.filter((f) => {
        if (f.isVisible === false) return false;
        if ((f.floorLevel ?? 0) !== fl.level - 1) return false;
        const lowerName = (f.name || '').toLowerCase();
        const lowerCat = (f.category || '').toLowerCase();
        const lowerCatId = (f.catalogId || '').toLowerCase();
        const isProcStair = (f.model || '').includes('stairs') || (f.model || '').includes('staircase');
        return lowerCat === 'stairs' || lowerName.includes('stair') || lowerCatId.includes('stair') || isProcStair;
      });

      if (fl.level > 0 && stairsBelowFloor.length > 0) {
        const padShape = new THREE.Shape();
        const hw = padW / 2;
        const hd = padD / 2;
        padShape.moveTo(-hw, -hd);
        padShape.lineTo(hw, -hd);
        padShape.lineTo(hw, hd);
        padShape.lineTo(-hw, hd);
        padShape.closePath();

        stairsBelowFloor.forEach((stair) => {
          const relX = (stair.x * CM) - ((minX + maxX) / 2);
          const relZ = (stair.y * CM) - ((minZ + maxZ) / 2);
          const sHw = (stair.width * CM) / 2 + 0.05;
          const sHd = (stair.depth * CM) / 2 + 0.05;
          const ang = stair.angle || 0;
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);

          const localPts = [
            { x: -sHw, y: -sHd },
            { x: sHw, y: -sHd },
            { x: sHw, y: sHd },
            { x: -sHw, y: sHd },
          ];
          const holePts = localPts.map((lp) => {
            const rx = relX + (lp.x * cos - lp.y * sin);
            const rz = relZ + (lp.x * sin + lp.y * cos);
            return { x: rx, y: -rz };
          });

          const hPath = new THREE.Path();
          hPath.moveTo(holePts[0].x, holePts[0].y);
          hPath.lineTo(holePts[1].x, holePts[1].y);
          hPath.lineTo(holePts[2].x, holePts[2].y);
          hPath.lineTo(holePts[3].x, holePts[3].y);
          hPath.closePath();
          padShape.holes.push(hPath);
        });

        const extrude = new THREE.ExtrudeGeometry(padShape, { depth: 0.06, bevelEnabled: false });
        extrude.rotateX(-Math.PI / 2);
        extrude.center();
        padGeom = extrude;
      } else {
        padGeom = new THREE.BoxGeometry(padW, 0.06, padD);
      }

      const padMat = new THREE.MeshStandardMaterial({
        color: fl.level === 0 ? 0xf1f5f9 : 0xe2e8f0,
        roughness: 0.9,
        metalness: 0.05,
      });
      const padMesh = new THREE.Mesh(padGeom, padMat);
      padMesh.position.set(centerX, offset.y - 0.03, centerZ);
      padMesh.receiveShadow = true;
      padMesh.userData = { id: `floor_pad_${fl.level}`, type: 'floorPad', floorLevel: fl.level };
      group.add(padMesh);
    });

    // Helper to test if a 2D point is inside a room polygon
    const isPointInRoomPolygon = (px: number, py: number, points: { x: number; y: number }[]): boolean => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;
        const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Helper to create stairwell cutout path in Shape coordinates (where Y is inverted: -y * CM)
    const buildStairHolePath = (stair: FurnitureItem) => {
      const hw = (stair.width * CM) / 2 + 0.05;
      const hd = (stair.depth * CM) / 2 + 0.05;
      const ang = stair.angle || 0;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);

      const localCorners = [
        { x: -hw, y: -hd },
        { x: hw, y: -hd },
        { x: hw, y: hd },
        { x: -hw, y: hd },
      ];

      const shapeCorners = localCorners.map((lp) => {
        const wx = (stair.x * CM) + (lp.x * cos - lp.y * sin);
        const wy = (stair.y * CM) + (lp.x * sin + lp.y * cos);
        return { x: wx, y: -wy }; // inverted Y for THREE.Shape coordinates
      });

      const holePath = new THREE.Path();
      holePath.moveTo(shapeCorners[0].x, shapeCorners[0].y);
      holePath.lineTo(shapeCorners[1].x, shapeCorners[1].y);
      holePath.lineTo(shapeCorners[2].x, shapeCorners[2].y);
      holePath.lineTo(shapeCorners[3].x, shapeCorners[3].y);
      holePath.closePath();
      return holePath;
    };

    // Helper to build Next Floor Stairwell Perimeter Safety Balustrade / Mezzanine Railing
    const buildStairwellGuardrail = (
      stair: FurnitureItem,
      floorOffset: { x: number; y: number; z: number },
      gapM: number = 0
    ): THREE.Group => {
      const guardGroup = new THREE.Group();
      const hw = (stair.width * CM) / 2 + 0.03;
      const hd = (stair.depth * CM) / 2 + 0.03;
      const railH = 0.92;
      const isGlass =
        (stair.model || '').includes('glass') ||
        (stair.model || '').includes('floating') ||
        stair.name.toLowerCase().includes('floating');

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        opacity: 0.42,
        transparent: true,
        roughness: 0.05,
        metalness: 0.1,
      });

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.75,
        roughness: 0.35,
      });

      const handrailMat = new THREE.MeshStandardMaterial({
        color: 0x92400e,
        roughness: 0.45,
        metalness: 0.08,
      });

      // Left edge balustrade (along Z, at X = -hw)
      if (isGlass) {
        const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.012, railH - 0.06, hd * 2), glassMat);
        leftGlass.position.set(-hw, (railH - 0.06) / 2, 0);
        guardGroup.add(leftGlass);

        const leftCap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, hd * 2), handrailMat);
        leftCap.position.set(-hw, railH, 0);
        guardGroup.add(leftCap);
      } else {
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, hd * 2), metalMat);
        leftRail.position.set(-hw, railH, 0);
        guardGroup.add(leftRail);

        for (let z = -hd; z <= hd; z += 0.45) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, railH, 0.025), metalMat);
          post.position.set(-hw, railH / 2, z);
          guardGroup.add(post);
        }
      }

      // Right edge balustrade (along Z, at X = hw)
      if (isGlass) {
        const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.012, railH - 0.06, hd * 2), glassMat);
        rightGlass.position.set(hw, (railH - 0.06) / 2, 0);
        guardGroup.add(rightGlass);

        const rightCap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, hd * 2), handrailMat);
        rightCap.position.set(hw, railH, 0);
        guardGroup.add(rightCap);
      } else {
        const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, hd * 2), metalMat);
        rightRail.position.set(hw, railH, 0);
        guardGroup.add(rightRail);

        for (let z = -hd; z <= hd; z += 0.45) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, railH, 0.025), metalMat);
          post.position.set(hw, railH / 2, z);
          guardGroup.add(post);
        }
      }

      // Back edge balustrade (along X, at Z = -hd)
      if (isGlass) {
        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, railH - 0.06, 0.012), glassMat);
        backGlass.position.set(0, (railH - 0.06) / 2, -hd);
        guardGroup.add(backGlass);

        const backCap = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.035, 0.035), handrailMat);
        backCap.position.set(0, railH, -hd);
        guardGroup.add(backCap);
      } else {
        const backRail = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.035, 0.035), metalMat);
        backRail.position.set(0, railH, -hd);
        guardGroup.add(backRail);

        for (let x = -hw; x <= hw; x += 0.4) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, railH, 0.025), metalMat);
          post.position.set(x, railH / 2, -hd);
          guardGroup.add(post);
        }
      }

      // 4 Sturdy Corner Posts at balustrade junctions
      const cornerPostGeom = new THREE.BoxGeometry(0.045, railH + 0.02, 0.045);
      [
        { x: -hw, z: -hd },
        { x: hw, z: -hd },
        { x: -hw, z: hd },
        { x: hw, z: hd },
      ].forEach((cp) => {
        const post = new THREE.Mesh(cornerPostGeom, metalMat);
        post.position.set(cp.x, (railH + 0.02) / 2, cp.z);
        guardGroup.add(post);
      });

      // If Next Floor is elevated with gap (gapM > 0), render vertical alignment attachment connector guides
      if (gapM > 0) {
        const guideMat = new THREE.LineDashedMaterial({
          color: 0x6366f1,
          dashSize: 0.1,
          gapSize: 0.05,
          transparent: true,
          opacity: 0.7,
        });
        const corners = [
          { x: -hw, z: -hd },
          { x: hw, z: -hd },
          { x: -hw, z: hd },
          { x: hw, z: hd },
        ];
        corners.forEach((c) => {
          const pts = [
            new THREE.Vector3(c.x, 0, c.z),
            new THREE.Vector3(c.x, -gapM, c.z),
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(lineGeom, guideMat);
          line.computeLineDistances();
          guardGroup.add(line);
        });
      }

      // Front edge (Z = +hd) is left OPEN for clear pedestrian walk-off onto the upper floor!
      guardGroup.position.set(stair.x * CM + floorOffset.x, floorOffset.y, stair.y * CM + floorOffset.z);
      guardGroup.rotation.y = -(stair.angle || 0);
      guardGroup.userData = { id: `${stair.id}_mezzanine_guard`, type: 'mezzanineGuardrail' };
      return guardGroup;
    };

    // 1. Build Rooms (Floors & Ceilings)
    plan.rooms.filter((r) => isFloorVisible(r.floorLevel ?? 0)).forEach((room) => {
      if (room.points.length < 3) return;
      const roomLevel = room.floorLevel ?? 0;
      const offset = getFloor3DOffset(roomLevel);

      // --- Room Floor Slab ---
      const floorShape = new THREE.Shape();
      floorShape.moveTo(room.points[0].x * CM, -room.points[0].y * CM);
      for (let i = 1; i < room.points.length; i++) {
        floorShape.lineTo(room.points[i].x * CM, -room.points[i].y * CM);
      }
      floorShape.closePath();

      // If room is on an upper floor, cut stairwell openings for stairs arriving from the floor below
      if (roomLevel > 0) {
        const stairsBelow = plan.furniture.filter((f) => {
          if (f.isVisible === false) return false;
          if ((f.floorLevel ?? 0) !== roomLevel - 1) return false;
          const lowerName = (f.name || '').toLowerCase();
          const lowerCat = (f.category || '').toLowerCase();
          const lowerCatId = (f.catalogId || '').toLowerCase();
          const isProcStair = (f.model || '').includes('stairs') || (f.model || '').includes('staircase');
          return lowerCat === 'stairs' || lowerName.includes('stair') || lowerCatId.includes('stair') || isProcStair;
        });

        stairsBelow.forEach((stair) => {
          if (isPointInRoomPolygon(stair.x, stair.y, room.points)) {
            floorShape.holes.push(buildStairHolePath(stair));
            const guardGroup = buildStairwellGuardrail(stair, offset, nextFloorGap);
            group.add(guardGroup);
          }
        });
      }

      // Intelligently select photorealistic architectural floor finish matching room type and color
      let floorTex = room.floorTexture ? getProceduralTexture(room.floorTexture, room.floorColor) : null;
      let floorRoughness = 0.5;
      let floorMetalness = 0.03;

      if (!floorTex) {
        const rName = (room.name || '').toLowerCase();
        const rColor = (room.floorColor || '').toLowerCase();
        const isWoodLike =
          rName.includes('kitchen') ||
          rName.includes('dining') ||
          rName.includes('corridor') ||
          rName.includes('hall') ||
          rColor.includes('eab308') ||
          rColor.includes('d4a373') ||
          rColor.includes('b45309') ||
          rColor.includes('c2410c');
        const isTileLike =
          rName.includes('bath') ||
          rName.includes('toilet') ||
          rName.includes('wash') ||
          rName.includes('laundry');

        if (isWoodLike) {
          floorTex = getProceduralTexture('hardwood_plank', room.floorColor || '#c89666');
          floorRoughness = 0.38; // Satin wood varnish with soft specular highlight!
          floorMetalness = 0.04;
        } else if (isTileLike) {
          floorTex = getProceduralTexture('ceramic_tile_grid', room.floorColor || '#e2e8f0');
          floorRoughness = 0.22; // High-gloss ceramic tile
          floorMetalness = 0.06;
        } else {
          // Living room, Master bedroom, Lounge: Plush woven carpet texture
          floorTex = getProceduralTexture('carpet_plush', room.floorColor || '#0f766e');
          floorRoughness = 0.92; // Warm plush woven carpet
          floorMetalness = 0.01;
        }
      } else {
        if (room.floorTexture?.includes('marble')) {
          floorRoughness = 0.18;
          floorMetalness = 0.08;
        } else if (room.floorTexture?.includes('wood') || room.floorTexture?.includes('parquet') || room.floorTexture?.includes('hardwood')) {
          floorRoughness = 0.38;
          floorMetalness = 0.04;
        }
      }

      if (floorTex) {
        floorTex.repeat.set(4, 4);
      }

      const geom = new THREE.ShapeGeometry(floorShape);
      const mat = new THREE.MeshStandardMaterial({
        color: room.floorColor ? new THREE.Color(room.floorColor) : 0xd8b48f,
        roughness: floorRoughness,
        metalness: floorMetalness,
        map: floorTex || undefined,
      });

      const floorMesh = new THREE.Mesh(geom, mat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(offset.x, offset.y + 0.005, offset.z);
      floorMesh.receiveShadow = true;
      floorMesh.userData = { id: room.id, type: 'roomFloor', floorLevel: roomLevel };
      group.add(floorMesh);

      // Warm Interior Ambient Bounce Light (simulates natural home room illumination)
      const roomPointsLen = room.points.length;
      if (roomPointsLen > 0) {
        const cx = (room.points.reduce((sum, p) => sum + p.x, 0) / roomPointsLen) * CM;
        const cz = (room.points.reduce((sum, p) => sum + p.y, 0) / roomPointsLen) * CM;
        const roomLight = new THREE.PointLight(0xfff3e3, 0.45, 9, 1.4);
        roomLight.position.set(cx + offset.x, offset.y + 2.1, cz + offset.z);
        group.add(roomLight);
      }

      // --- DecoFrog 3D Architectural Ceiling (Top View Option: Removed vs Kept) ---
      const shouldRenderCeiling = showCeiling || cameraMode === 'visitor';
      if (shouldRenderCeiling) {
        const ceilShape = new THREE.Shape();
        ceilShape.moveTo(room.points[0].x * CM, -room.points[0].y * CM);
        for (let i = 1; i < room.points.length; i++) {
          ceilShape.lineTo(room.points[i].x * CM, -room.points[i].y * CM);
        }
        ceilShape.closePath();

        // Cut stairwell opening in ceiling for stairs on this floor climbing upward
        const stairsGoingUp = plan.furniture.filter((f) => {
          if (f.isVisible === false) return false;
          if ((f.floorLevel ?? 0) !== roomLevel) return false;
          const lowerName = (f.name || '').toLowerCase();
          const lowerCat = (f.category || '').toLowerCase();
          const lowerCatId = (f.catalogId || '').toLowerCase();
          const isProcStair = (f.model || '').includes('stairs') || (f.model || '').includes('staircase');
          return lowerCat === 'stairs' || lowerName.includes('stair') || lowerCatId.includes('stair') || isProcStair;
        });

        stairsGoingUp.forEach((stair) => {
          if (isPointInRoomPolygon(stair.x, stair.y, room.points)) {
            ceilShape.holes.push(buildStairHolePath(stair));
          }
        });

        const ceilGeom = new THREE.ShapeGeometry(ceilShape);
        const ceilHeightM = (room.ceilingHeight || 280) * CM;
        const ceilMat = new THREE.MeshStandardMaterial({
          color: room.ceilingColor ? new THREE.Color(room.ceilingColor) : 0xf8fafc,
          roughness: 0.9,
          metalness: 0.02,
          side: cameraMode === 'visitor' ? THREE.DoubleSide : THREE.BackSide,
        });
        const ceilMesh = new THREE.Mesh(ceilGeom, ceilMat);
        ceilMesh.rotation.x = -Math.PI / 2;
        ceilMesh.position.set(offset.x, offset.y + ceilHeightM, offset.z);
        ceilMesh.userData = { id: `${room.id}_ceiling`, type: 'roomCeiling', floorLevel: roomLevel };
        group.add(ceilMesh);
      }
    });

    // 2. Build Walls with Architectural Openings / Cutouts for Doors & Windows
    plan.walls.filter((w) => isFloorVisible(w.floorLevel ?? 0)).forEach((wall) => {
      const offset = getFloor3DOffset(wall.floorLevel ?? 0);
      const x1 = wall.xStart * CM;
      const z1 = wall.yStart * CM;
      const x2 = wall.xEnd * CM;
      const z2 = wall.yEnd * CM;

      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      const height = (wall.height || 250) * CM;
      const thickness = (wall.thickness || 15) * CM;
      const isSelected = selectedId === wall.id;

      const wallTex = wall.texture
        ? getProceduralTexture(wall.texture, wall.color)
        : getProceduralTexture('matte_wall_paint', wall.color || '#f8fafc');
      if (wallTex) {
        wallTex.repeat.set(Math.max(1.5, length * 1.5), Math.max(1.5, height * 1.5));
      }

      const isWallTexture = Boolean(wall.texture);
      const isRoyale = wall.texture?.includes('royale');
      const isRoyalPly = wall.texture?.includes('royal_ply');
      const isBrick = wall.texture?.includes('brick') || wall.texture?.includes('stone');

      const mat = new THREE.MeshStandardMaterial({
        color: isSelected
          ? 0x38bdf8
          : isWallTexture
          ? 0xffffff
          : wall.color
          ? new THREE.Color(wall.color)
          : 0xf8fafc,
        roughness: isRoyale ? 0.45 : isRoyalPly ? 0.38 : isBrick ? 0.92 : 0.88,
        metalness: isRoyale ? 0.12 : isRoyalPly ? 0.04 : 0.01,
        map: wallTex || undefined,
      });

      // BoxGeometry receives uniform material across all faces (top, sides, ends)
      const wallMaterials = mat;

      // Selection edge highlight only (removes dark cage lines on unselected walls)
      const attachWallEdges = (targetMesh: THREE.Mesh) => {
        if (!isSelected) return;
        const edgesGeom = new THREE.EdgesGeometry(targetMesh.geometry, 15);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x0284c7,
          linewidth: 2,
          transparent: true,
          opacity: 0.95,
        });
        const edgeLines = new THREE.LineSegments(edgesGeom, edgeMat);
        targetMesh.add(edgeLines);
      };

      // Find any doors or windows placed along this wall
      const wallFloor = wall.floorLevel ?? 0;
      const wallOpenings = plan.furniture.filter((f) => {
        if ((f.floorLevel ?? 0) !== wallFloor) return false;
        const isOpening =
          f.category === 'Doors & Windows' ||
          (f.name || '').toLowerCase().includes('door') ||
          (f.name || '').toLowerCase().includes('window');
        if (!isOpening) return false;

        // Project opening position onto wall line
        const fx = f.x * CM;
        const fz = f.y * CM;
        const d = Math.abs((x2 - x1) * (z1 - fz) - (x1 - fx) * (z2 - z1)) / length;
        if (d > 0.45) return false; // More than 45cm away from wall centerline

        const dot = ((fx - x1) * dx + (fz - z1) * dz) / (length * length);
        return dot >= -0.05 && dot <= 1.05;
      });

      if (wallOpenings.length === 0) {
        // Solid wall segment
        const geom = new THREE.BoxGeometry(length, height, thickness);
        const wallMesh = new THREE.Mesh(geom, wallMaterials);
        wallMesh.position.set(
          (x1 + x2) / 2 + offset.x,
          offset.y + height / 2,
          (z1 + z2) / 2 + offset.z
        );
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallMesh.userData = { id: wall.id, type: 'wall', floorLevel: wallFloor };
        attachWallEdges(wallMesh);
        group.add(wallMesh);
      } else {
        // Build wall segments with cutouts (Left sub-wall, Right sub-wall, and Top Lintel above opening)
        // Sort openings by distance along wall from start point
        const sortedOpenings = wallOpenings.map((op) => {
          const fx = op.x * CM;
          const fz = op.y * CM;
          const distAlong = Math.max(0, Math.min(length, ((fx - x1) * dx + (fz - z1) * dz) / length));
          const opWidth = (op.width || 90) * CM;
          const opHeight = (op.height || 210) * CM;
          const opElevation = (op.elevation || 0) * CM;
          return {
            distAlong,
            start: Math.max(0, distAlong - opWidth / 2),
            end: Math.min(length, distAlong + opWidth / 2),
            height: opHeight,
            elevation: opElevation,
          };
        }).sort((a, b) => a.start - b.start);

        const wallGroup = new THREE.Group();
        wallGroup.position.set(x1 + offset.x, offset.y, z1 + offset.z);
        wallGroup.rotation.y = -angle;
        wallGroup.userData = { id: wall.id, type: 'wall', floorLevel: wallFloor };

        let curPos = 0;
        sortedOpenings.forEach((op) => {
          // Left solid section
          const leftLen = op.start - curPos;
          if (leftLen > 0.05) {
            const leftGeom = new THREE.BoxGeometry(leftLen, height, thickness);
            const leftMesh = new THREE.Mesh(leftGeom, wallMaterials);
            leftMesh.position.set(curPos + leftLen / 2, height / 2, 0);
            leftMesh.castShadow = true;
            leftMesh.receiveShadow = true;
            attachWallEdges(leftMesh);
            wallGroup.add(leftMesh);
          }

          // Top Header / Lintel above door or window opening
          const openLen = op.end - op.start;
          const lintelH = Math.max(0, height - (op.elevation + op.height));
          if (lintelH > 0.04 && openLen > 0.05) {
            const lintelGeom = new THREE.BoxGeometry(openLen, lintelH, thickness);
            const lintelMesh = new THREE.Mesh(lintelGeom, wallMaterials);
            lintelMesh.position.set(op.start + openLen / 2, (op.elevation + op.height) + lintelH / 2, 0);
            lintelMesh.castShadow = true;
            lintelMesh.receiveShadow = true;
            attachWallEdges(lintelMesh);
            wallGroup.add(lintelMesh);
          }

          // Bottom Sill (for windows with elevation above floor)
          if (op.elevation > 0.05 && openLen > 0.05) {
            const sillGeom = new THREE.BoxGeometry(openLen, op.elevation, thickness);
            const sillMesh = new THREE.Mesh(sillGeom, wallMaterials);
            sillMesh.position.set(op.start + openLen / 2, op.elevation / 2, 0);
            sillMesh.castShadow = true;
            sillMesh.receiveShadow = true;
            attachWallEdges(sillMesh);
            wallGroup.add(sillMesh);
          }

          curPos = op.end;
        });

        // Final solid section to wall end
        const remLen = length - curPos;
        if (remLen > 0.05) {
          const remGeom = new THREE.BoxGeometry(remLen, height, thickness);
          const remMesh = new THREE.Mesh(remGeom, wallMaterials);
          remMesh.position.set(curPos + remLen / 2, height / 2, 0);
          remMesh.castShadow = true;
          remMesh.receiveShadow = true;
          attachWallEdges(remMesh);
          wallGroup.add(remMesh);
        }

        group.add(wallGroup);
      }
    });

    // 2.1 Seamless Architectural Corner Junctions
    // Where 2 or more walls intersect at a corner, fill the outer corner notch seamlessly
    const visibleWallsForCorners = plan.walls.filter((w) => isFloorVisible(w.floorLevel ?? 0));
    interface CornerVertex {
      x: number;
      z: number;
      floorLevel: number;
      walls: typeof visibleWallsForCorners;
    }
    const cornerVertices: CornerVertex[] = [];
    const registerCornerEndpoint = (
      wx: number,
      wz: number,
      floorLevel: number,
      wallRef: (typeof visibleWallsForCorners)[0]
    ) => {
      const TOLERANCE = 0.08; // 8cm
      let found = cornerVertices.find(
        (cv) => cv.floorLevel === floorLevel && Math.hypot(cv.x - wx, cv.z - wz) < TOLERANCE
      );
      if (!found) {
        found = { x: wx, z: wz, floorLevel, walls: [] };
        cornerVertices.push(found);
      }
      if (!found.walls.some((w) => w.id === wallRef.id)) {
        found.walls.push(wallRef);
      }
    };

    visibleWallsForCorners.forEach((w) => {
      const fl = w.floorLevel ?? 0;
      registerCornerEndpoint(w.xStart * CM, w.yStart * CM, fl, w);
      registerCornerEndpoint(w.xEnd * CM, w.yEnd * CM, fl, w);
    });

    cornerVertices.forEach((cv) => {
      if (cv.walls.length >= 2) {
        const maxThickness = Math.max(...cv.walls.map((w) => (w.thickness || 15) * CM));
        const maxHeight = Math.max(...cv.walls.map((w) => (w.height || 280) * CM));
        const hasSelected = cv.walls.some((w) => w.id === selectedId);
        const primary = cv.walls.find((w) => w.id === selectedId) || cv.walls[0];
        const offset = getFloor3DOffset(cv.floorLevel);

        const cornerTex = primary.texture
          ? getProceduralTexture(primary.texture, primary.color)
          : getProceduralTexture('matte_wall_paint', primary.color || '#f8fafc');

        const cornerMat = new THREE.MeshStandardMaterial({
          color: hasSelected
            ? 0x38bdf8
            : primary.texture
            ? 0xffffff
            : primary.color
            ? new THREE.Color(primary.color)
            : 0xf8fafc,
          roughness: primary.texture?.includes('royale')
            ? 0.45
            : primary.texture?.includes('royal_ply')
            ? 0.38
            : primary.texture?.includes('brick') || primary.texture?.includes('stone')
            ? 0.92
            : 0.88,
          metalness: primary.texture?.includes('royale')
            ? 0.12
            : primary.texture?.includes('royal_ply')
            ? 0.04
            : 0.01,
          map: cornerTex || undefined,
        });

        const cornerGeom = new THREE.BoxGeometry(maxThickness, maxHeight, maxThickness);
        const cornerMesh = new THREE.Mesh(cornerGeom, cornerMat);
        cornerMesh.position.set(cv.x + offset.x, offset.y + maxHeight / 2, cv.z + offset.z);
        cornerMesh.castShadow = true;
        cornerMesh.receiveShadow = true;
        cornerMesh.userData = { id: primary.id, type: 'wall', floorLevel: cv.floorLevel };
        group.add(cornerMesh);
      }
    });

    // 3. Build Furniture Items (with VIBRANT RED GLOW on Collision)
    plan.furniture.filter((f) => isFloorVisible(f.floorLevel ?? 0)).forEach((item) => {
      if (item.isVisible === false) return;

      const isSelected = selectedId === item.id;
      const isColliding = collidingItemIds.has(item.id);
      const offset = getFloor3DOffset(item.floorLevel ?? 0);

      const isCeiling =
        item.placementType === 'ceiling' ||
        (item.category || '').toLowerCase().includes('ceiling') ||
        (item.name || '').toLowerCase().includes('pendant') ||
        (item.name || '').toLowerCase().includes('chandelier') ||
        (item.name || '').toLowerCase().includes('ceiling fan') ||
        (item.name || '').toLowerCase().includes('downlight') ||
        (item.name || '').toLowerCase().includes('flush light') ||
        (item.name || '').toLowerCase().includes('flush panel');

      const isStair =
        (item.category || '').toLowerCase() === 'stairs' ||
        (item.category || '').toLowerCase().includes('stair') ||
        (item.name || '').toLowerCase().includes('stair') ||
        (item.catalogId || '').toLowerCase().includes('stair') ||
        (item.model || '').toLowerCase().includes('stair');

      const curFloorLevel = item.floorLevel ?? 0;
      const curFloor = plan.floors?.find((fl) => fl.level === curFloorLevel);
      const nextFloor = plan.floors?.find((fl) => fl.level === curFloorLevel + 1);

      let effectiveHeight = item.height || 250;
      if (isStair) {
        // ONLY interior floor-to-floor staircases should bridge floorElevationGap!
        // Outdoor entry steps, garden stoops, and porch deck stairs retain their realistic architectural height.
        const isOutdoorStair =
          item.name.toLowerCase().includes('entry') ||
          item.name.toLowerCase().includes('concrete') ||
          item.name.toLowerCase().includes('porch') ||
          item.name.toLowerCase().includes('deck') ||
          item.name.toLowerCase().includes('stone steps') ||
          (item.height !== undefined && item.height <= 160);

        if (!isOutdoorStair) {
          const curElevation = curFloor?.elevation ?? (curFloorLevel * 260);
          const nextElevation = nextFloor?.elevation ?? (curElevation + (curFloor?.height || 260));
          const floorElevationGap = Math.max(150, nextElevation - curElevation);
          effectiveHeight = floorElevationGap;
        } else {
          effectiveHeight = item.height || 45;
        }
      }
      const itemWithEffectiveHeight = isStair ? { ...item, height: effectiveHeight } : item;

      const floorHeightCm = 250; // standard floor ceiling height
      let effectiveElevation = item.elevation !== undefined ? item.elevation : 0;
      if (isCeiling && (!item.elevation || item.elevation < 50)) {
        // Automatically mount ceiling fixtures to ceiling height (250cm - height)
        effectiveElevation = Math.max(120, floorHeightCm - (item.height || 50));
      }

      let itemPosX = item.x * CM;
      let itemPosZ = item.y * CM;
      let itemRotY = -(item.angle || 0);

      const lowerName = (item.name || '').toLowerCase();
      const lowerCat = (item.category || '').toLowerCase();
      const lowerCatId = (item.catalogId || '').toLowerCase();
      const isOpening =
        lowerCat === 'doors & windows' ||
        lowerCat.includes('door') ||
        lowerCat.includes('window') ||
        lowerName.includes('door') ||
        lowerName.includes('window') ||
        lowerCatId.includes('door') ||
        lowerCatId.includes('window');

      if (isOpening) {
        // Snap opening position onto nearest wall centerline and align angle
        const hostWall = plan.walls.find((w) => {
          if ((w.floorLevel ?? 0) !== (item.floorLevel ?? 0)) return false;
          const wx1 = w.xStart * CM;
          const wz1 = w.yStart * CM;
          const wx2 = w.xEnd * CM;
          const wz2 = w.yEnd * CM;
          const wdx = wx2 - wx1;
          const wdz = wz2 - wz1;
          const wLen = Math.hypot(wdx, wdz);
          if (wLen < 0.001) return false;
          const dist = Math.abs(wdx * (wz1 - itemPosZ) - (wx1 - itemPosX) * wdz) / wLen;
          if (dist > 0.45) return false;
          const dot = ((itemPosX - wx1) * wdx + (itemPosZ - wz1) * wdz) / (wLen * wLen);
          return dot >= -0.05 && dot <= 1.05;
        });

        if (hostWall) {
          const wx1 = hostWall.xStart * CM;
          const wz1 = hostWall.yStart * CM;
          const wx2 = hostWall.xEnd * CM;
          const wz2 = hostWall.yEnd * CM;
          const wdx = wx2 - wx1;
          const wdz = wz2 - wz1;
          const wLen = Math.hypot(wdx, wdz);
          const dot = ((itemPosX - wx1) * wdx + (itemPosZ - wz1) * wdz) / (wLen * wLen);
          itemPosX = wx1 + Math.max(0, Math.min(1, dot)) * wdx;
          itemPosZ = wz1 + Math.max(0, Math.min(1, dot)) * wdz;
          const wallAngle = Math.atan2(wdz, wdx);
          const isFlipped = Math.abs(Math.abs((item.angle || 0) - wallAngle) - Math.PI) < 0.5;
          itemRotY = -(wallAngle + (isFlipped ? Math.PI : 0));
        }
      }

      const itemGroup = new THREE.Group();
      itemGroup.position.set(
        itemPosX + offset.x,
        offset.y + effectiveElevation * CM,
        itemPosZ + offset.z
      );

      // If ceiling fixture and hanging with gap to ceiling, render suspension wire & ceiling mount plate
      if (isCeiling) {
        const topOfItemCm = effectiveElevation + (item.height || 50);
        const gapToCeilingCm = Math.max(0, floorHeightCm - topOfItemCm);
        if (gapToCeilingCm > 2) {
          const cableH = gapToCeilingCm * CM;
          const cableGeom = new THREE.CylinderGeometry(0.003, 0.003, cableH, 8);
          const cableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
          const cableMesh = new THREE.Mesh(cableGeom, cableMat);
          cableMesh.position.set(0, (item.height * CM) + cableH / 2, 0);
          itemGroup.add(cableMesh);

          const canopyGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.015, 16);
          const canopyMesh = new THREE.Mesh(canopyGeom, cableMat);
          canopyMesh.position.set(0, (item.height * CM) + cableH, 0);
          itemGroup.add(canopyMesh);
        }
      }
      itemGroup.rotation.y = itemRotY;
      itemGroup.userData = { id: item.id, type: 'furniture', floorLevel: item.floorLevel ?? 0, isColliding };

      let itemMat: THREE.MeshStandardMaterial;
      const baseColor = item.color || (item.category === 'Doors & Windows' ? '#fef08a' : '#94a3b8');
      const itemRoughness = item.roughness !== undefined ? item.roughness : 0.4;
      const itemMetalness = item.metalness !== undefined ? item.metalness : 0.15;
      const itemOpacity = item.opacity !== undefined ? item.opacity : 1.0;
      const isTransparent = itemOpacity < 1.0;

      if (isColliding) {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
          emissive: new THREE.Color(0xef4444),
          emissiveIntensity: 0.35,
        });
      } else if (isSelected) {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
          emissive: new THREE.Color(0x4f46e5),
          emissiveIntensity: 0.35,
        });
      } else if (hoveredId === item.id) {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
          emissive: new THREE.Color(0x38bdf8),
          emissiveIntensity: 0.3,
        });
      } else {
        itemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          roughness: itemRoughness,
          metalness: itemMetalness,
          opacity: itemOpacity,
          transparent: isTransparent,
        });
      }

      const partMats = buildSubPartMaterials(item, itemMat);
      const hasPartColors = !!(item.partColors && Object.keys(item.partColors).length > 0);

      if (item.model && item.model.startsWith('procedural:')) {
        try {
          const parts = item.model.split(':');
          const pType = parts[1];
          const rawParams = parts.slice(2).join(':');
          const parsed = rawParams ? JSON.parse(rawParams) : {};

          let procGroup: THREE.Group | null = buildProceduralMeshGroup(
            pType,
            parsed,
            item.width,
            item.depth,
            effectiveHeight,
            itemMat,
            partMats
          );

          if (!procGroup) {
            procGroup = buildSmartArchetypeFallback(itemWithEffectiveHeight, itemMat, partMats);
          }

          if (procGroup) {
            procGroup.userData = { isColliding };
            itemGroup.add(procGroup);
          } else {
            const geom = new THREE.BoxGeometry(item.width * CM, effectiveHeight * CM, item.depth * CM);
            const mesh = new THREE.Mesh(geom, itemMat);
            mesh.position.y = (effectiveHeight * CM) / 2;
            itemGroup.add(mesh);
          }
        } catch (e) {
          const fallback = buildSmartArchetypeFallback(itemWithEffectiveHeight, itemMat, partMats);
          fallback.userData = { isColliding };
          itemGroup.add(fallback);
        }
      } else if (item.model && (item.model.endsWith('.glb') || item.model.endsWith('.gltf') || item.model.startsWith('blob_model:') || item.model.includes('.glb?') || item.model.includes('.gltf?'))) {
        const tempFallback = buildSmartArchetypeFallback(itemWithEffectiveHeight, itemMat, partMats);
        tempFallback.name = 'temp_fallback';
        tempFallback.userData = { isColliding };
        itemGroup.add(tempFallback);

        const modelUrl = item.model.startsWith('blob_model:') ? getLocalModelBlob(item.model) || item.model : item.model;
        loadGltfModel(modelUrl, item.width, item.depth, effectiveHeight)
          .then((gltfGroup) => {
            gltfGroup.userData = { isColliding };
            const existingFallback = itemGroup.getObjectByName('temp_fallback');
            if (existingFallback) {
              itemGroup.remove(existingFallback);
            }
            itemGroup.add(gltfGroup);
          })
          .catch((err) => {
            console.warn('GLTF load failed, keeping fallback:', err);
          });
      } else if (item.model && (item.model.endsWith('.obj') || item.model.startsWith('local_obj:') || item.model.startsWith('data:'))) {
        // Immediate smart archetype fallback while real high-poly OBJ model is loading
        const tempFallback = buildSmartArchetypeFallback(itemWithEffectiveHeight, itemMat, partMats);
        tempFallback.name = 'temp_fallback';
        tempFallback.userData = { isColliding };
        itemGroup.add(tempFallback);

        loadObjModel(item.model).then((objModel) => {
          // If model failed or returned single-box fallback and item is a window or door, retain the rich procedural mesh
          const isOpeningObj =
            (item.category || '').toLowerCase().includes('window') ||
            (item.name || '').toLowerCase().includes('window') ||
            (item.catalogId || '').toLowerCase().includes('window') ||
            (item.category || '').toLowerCase().includes('door') ||
            (item.name || '').toLowerCase().includes('door') ||
            (item.catalogId || '').toLowerCase().includes('door');

          if (isOpeningObj && objModel.parts.length === 1 && objModel.parts[0].groupName === 'default') {
            return;
          }

          const targetW = item.width * CM;
          const targetD = item.depth * CM;
          const targetH = effectiveHeight * CM;

          const scaleX = objModel.size.x > 0 ? targetW / objModel.size.x : targetW;
          const scaleY = objModel.size.y > 0 ? targetH / objModel.size.y : targetH;
          const scaleZ = objModel.size.z > 0 ? targetD / objModel.size.z : targetD;

          const realObjGroup = new THREE.Group();
          realObjGroup.userData = { isColliding };

          objModel.parts.forEach((part) => {
            const mappedPartId = mapObjGroupToPartId(part.groupName, item.category, item.name);
            const partMaterial = (partMats && mappedPartId && partMats[mappedPartId]) || itemMat;

            const partMesh = new THREE.Mesh(part.geometry, partMaterial);
            partMesh.castShadow = true;
            partMesh.receiveShadow = true;
            partMesh.userData = { partId: mappedPartId, groupName: part.groupName, isColliding };
            realObjGroup.add(partMesh);
          });

          realObjGroup.scale.set(scaleX, scaleY, scaleZ);
          realObjGroup.position.y = targetH / 2;

          // Remove temp fallback and add real multi-part high-detail OBJ model
          const existingFallback = itemGroup.getObjectByName('temp_fallback');
          if (existingFallback) {
            itemGroup.remove(existingFallback);
          }
          itemGroup.add(realObjGroup);
        }).catch(() => {
          // Keep the smart archetype fallback
        });
      } else {
        const smartFallback = buildSmartArchetypeFallback(itemWithEffectiveHeight, itemMat, partMats);
        smartFallback.userData = { isColliding };
        itemGroup.add(smartFallback);
      }

      if (item.category === 'Lighting' && !isColliding) {
        const lightColorHex = item.lightColor || '#fef08a';
        const lightIntensityVal = item.lightIntensity !== undefined ? item.lightIntensity : 1.2;
        const spot = new THREE.PointLight(new THREE.Color(lightColorHex), lightIntensityVal, 8);
        // Ceiling lights shine downwards from the bottom of the fixture
        spot.position.y = isCeiling ? Math.max(0.08, (effectiveHeight * CM) * 0.25) : effectiveHeight * CM + 0.15;
        spot.castShadow = true;
        itemGroup.add(spot);
      }

      group.add(itemGroup);
    });
  }, [plan, collidingItemIds, activeFloor, floor3DMode, showCeiling, cameraMode, nextFloorGap]);

  // Update Selection & Hover highlights smoothly in 3D without tearing down the scene graph
  useEffect(() => {
    const group = meshesGroupRef.current;
    if (!group) return;

    group.traverse((child) => {
      let current: THREE.Object3D | null = child;
      let targetId: string | null = null;
      let targetType: string | null = null;

      while (current && current !== group) {
        if (current.userData && current.userData.id) {
          targetId = current.userData.id;
          targetType = current.userData.type;
          break;
        }
        current = current.parent;
      }

      if (targetId && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).emissive) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const isSelected = selectedId === targetId;
          const isHovered = hoveredId === targetId;
          const isColliding = current?.userData?.isColliding;

          if (isColliding) {
            mat.emissive.setHex(0xef4444);
            mat.emissiveIntensity = 0.35;
          } else if (isSelected) {
            mat.emissive.setHex(0x4f46e5); // Indigo selection highlight
            mat.emissiveIntensity = 0.45;
          } else if (isHovered) {
            mat.emissive.setHex(0x38bdf8); // Sky blue hover highlight
            mat.emissiveIntensity = 0.35;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [selectedId, hoveredId]);


  // Capture Photo Snapshot based on selected floor
  const handleTakePhotoSnapshot = () => {
    setIsRenderStudioOpen(true);
  };

  const handleCaptureRenderStudioSnapshot = async (settings: RenderSnapshotSettings): Promise<string | null> => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return null;

    // Determine target dimensions based on aspect ratio & resolution multiplier
    let baseWidth = 1920;
    let baseHeight = 1080;
    if (settings.aspectRatio === '4:3') {
      baseWidth = 1600;
      baseHeight = 1200;
    } else if (settings.aspectRatio === '1:1') {
      baseWidth = 1440;
      baseHeight = 1440;
    } else if (settings.aspectRatio === '9:16') {
      baseWidth = 1080;
      baseHeight = 1920;
    }

    const targetWidth = baseWidth * (settings.resolutionMultiplier === 4 ? 2 : settings.resolutionMultiplier === 2 ? 1.25 : 0.8);
    const targetHeight = baseHeight * (settings.resolutionMultiplier === 4 ? 2 : settings.resolutionMultiplier === 2 ? 1.25 : 0.8);

    // Save current renderer state
    const originalSize = new THREE.Vector2();
    renderer.getSize(originalSize);
    const originalAspect = camera.aspect;

    // Render offscreen at target high-resolution & exact aspect ratio
    camera.aspect = targetWidth / targetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(targetWidth, targetHeight, false);
    renderer.render(scene, camera);

    // Create compositing canvas to add branding watermark if enabled
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');

    if (ctx) {
      // Draw 3D scene render
      ctx.drawImage(renderer.domElement, 0, 0);

      // Add architectural watermark & project metadata if enabled
      if (settings.includeWatermark) {
        ctx.save();
        // Subtle dark gradient bar at bottom
        const grad = ctx.createLinearGradient(0, targetHeight - 80, 0, targetHeight);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, targetHeight - 80, targetWidth, 80);

        // Watermark text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(settings.watermarkText || 'Visual Rendered 3D Studio', 32, targetHeight - 28);

        // Right side metadata
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'right';
        const floorText = activeFloor === 0 ? 'Ground Floor' : activeFloor === 1 ? '1st Floor' : `Floor ${activeFloor}`;
        ctx.fillText(`${plan.name || 'Architecture'} • ${floorText}`, targetWidth - 32, targetHeight - 28);
        ctx.restore();
      }
    }

    const dataUrl = finalCanvas.toDataURL('image/png');

    // Restore original canvas view
    camera.aspect = originalAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(originalSize.x, originalSize.y, false);
    renderer.render(scene, camera);

    return dataUrl;
  };

  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // 3D Pick-and-Drag / Orbit / Pan / Visitor Look
  // Accurate helper to find the front-most interactive 3D furniture or wall mesh under pointer
  const findItemAtPointer = (
    clientX: number,
    clientY: number
  ): { id: string | null; type: 'furniture' | 'wall' | 'floorSign' | 'floorPad' | 'roomFloor' | null; floorLevel?: number } => {
    if (!cameraRef.current || !meshesGroupRef.current || !canvasMountRef.current) {
      return { id: null, type: null, floorLevel: undefined };
    }
    const rect = canvasMountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);

    for (const hit of intersects) {
      if (!hit.object.visible) continue;

      let current: THREE.Object3D | null = hit.object;
      while (current && current !== meshesGroupRef.current) {
        if (current.userData && current.userData.id) {
          const type = current.userData.type;
          const floorLvl = current.userData.floorLevel;
          if (type === 'furniture' || type === 'wall' || type === 'floorSign' || type === 'floorPad' || type === 'roomFloor') {
            return { id: current.userData.id, type, floorLevel: floorLvl };
          }
        }
        current = current.parent;
      }
    }

    return { id: null, type: null, floorLevel: undefined };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    hasMovedPastThresholdRef.current = false;
    canDragSelectedItemRef.current = false;
    pendingClickedItemRef.current = null;

    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    // Free Hand / Pan Tool or Middle/Right click: Strictly Pan camera view, NEVER select or drag furniture
    if (isFreeHand || e.button === 1 || e.button === 2) {
      isPanningRef.current = true;
      setIsPanningState(true);
      return;
    }

    // Check if user pressed on 3D furniture or wall item
    if (
      cameraModeRef.current === 'aerial' &&
      toolModeRef.current === 'select' &&
      !isSpacePressedRef.current &&
      e.button === 0
    ) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      if (hit.id && hit.type) {
        pendingClickedItemRef.current = { id: hit.id, type: hit.type };

        // If user pressed on the ALREADY selected furniture item, prepare for possible 3D translation drag
        if (hit.type === 'furniture' && selectedIdRef.current === hit.id) {
          const item = planRef.current.furniture.find((f) => f.id === hit.id);
          if (item && !item.isLocked) {
            canDragSelectedItemRef.current = true;
            draggedItemIdRef.current = item.id;

            const offset = getFloor3DOffset(item.floorLevel || 0);
            const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
            const hitPoint = new THREE.Vector3();
            const rect = canvasMountRef.current!.getBoundingClientRect();
            const mouse = new THREE.Vector2(
              ((e.clientX - rect.left) / rect.width) * 2 - 1,
              -((e.clientY - rect.top) / rect.height) * 2 + 1
            );
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current!);
            if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
              dragOffsetRef.current = {
                x: hitPoint.x - (item.x * 0.01 + offset.x),
                z: hitPoint.z - (item.y * 0.01 + offset.z),
              };
            }
          }
        }
      }
    }

    // Default: Smooth Camera Orbit / Pan on drag
    if (e.button === 0) {
      isDraggingRef.current = true;
      if (cameraModeRef.current === 'visitor') {
        setIsDraggingLookState(true);
      }
    } else if (e.button === 2 || e.button === 1) {
      isPanningRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    const moveDist = Math.hypot(
      e.clientX - mouseDownPosRef.current.x,
      e.clientY - mouseDownPosRef.current.y
    );
    if (moveDist > 4) {
      hasMovedPastThresholdRef.current = true;
    }

    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    // 1. ACTIVE 3D FURNITURE DRAGGING & PLACEMENT (Only when dragging an already selected item past threshold)
    if (
      !isFreeHand &&
      hasMovedPastThresholdRef.current &&
      canDragSelectedItemRef.current &&
      draggedItemIdRef.current &&
      cameraRef.current &&
      canvasMountRef.current &&
      onUpdatePlanRef.current
    ) {
      isDraggingRef.current = false; // Cancel camera orbit
      if (!isDraggingObjectRef.current) {
        isDraggingObjectRef.current = true;
        setIsDraggingObjectState(true);
      }

      const rect = canvasMountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const currentItem = planRef.current.furniture.find(
        (f) => f.id === draggedItemIdRef.current
      );

      const offset = getFloor3DOffset(currentItem?.floorLevel || 0);
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
      const hitPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
        const targetWorldX = hitPoint.x - dragOffsetRef.current.x - offset.x;
        const targetWorldZ = hitPoint.z - dragOffsetRef.current.z - offset.z;

        // Convert world meters to plan cm with 5cm magnetic grid snapping
        const rawPlanX = targetWorldX * 100;
        const rawPlanY = targetWorldZ * 100;
        const snappedX = Math.round(rawPlanX / 5) * 5;
        const snappedY = Math.round(rawPlanY / 5) * 5;

        if (currentItem && (currentItem.x !== snappedX || currentItem.y !== snappedY)) {
          let updatedItem: FurnitureItem = { ...currentItem, x: snappedX, y: snappedY };

          // If tabletop item, auto-attach to any supporting table beneath it
          if (isTabletopItem(updatedItem)) {
            const attachResult = autoAttachToTabletop(updatedItem, planRef.current.furniture);
            updatedItem = {
              ...updatedItem,
              elevation: attachResult.targetElevation,
              hostFurnitureId: attachResult.host ? attachResult.host.id : undefined,
            };
          }

          onUpdatePlanRef.current({
            ...planRef.current,
            furniture: planRef.current.furniture.map((f) =>
              f.id === draggedItemIdRef.current ? updatedItem : f
            ),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      return;
    }

    // 2. HOVER DETECTION & HIGHLIGHT (Instant 60fps, non-blocking)
    if (
      cameraModeRef.current === 'aerial' &&
      !isDraggingRef.current &&
      !isPanningRef.current &&
      !isDraggingObjectRef.current
    ) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      const nextHoverId = hit.id;
      if (nextHoverId !== hoveredIdRef.current) {
        setHoveredId(nextHoverId);
        setIsHoveringObject(!!nextHoverId);
      }
    } else if (hoveredIdRef.current !== null && (isDraggingRef.current || isPanningRef.current)) {
      setHoveredId(null);
      setIsHoveringObject(false);
    }

    // 3. CAMERA ORBIT / PAN / VISITOR HEAD LOOK
    if (cameraMode === 'visitor') {
      if (isDraggingRef.current) {
        const maxPitch = 0.28; // ~16° max top/bottom tilt
        visitorYawRef.current -= dx * 0.005;
        visitorPitchRef.current = Math.max(
          -maxPitch,
          Math.min(maxPitch, visitorPitchRef.current - dy * 0.0015)
        );
      } else if (isPanningRef.current) {
        // Free Hand Strafe/Pan in Visitor Walk Mode
        const panSpeed = 0.008;
        const forward = new THREE.Vector3(
          Math.sin(visitorYawRef.current),
          0,
          -Math.cos(visitorYawRef.current)
        );
        const right = new THREE.Vector3(
          Math.cos(visitorYawRef.current),
          0,
          Math.sin(visitorYawRef.current)
        );
        visitorPosRef.current.addScaledVector(right, -dx * panSpeed);
        visitorPosRef.current.addScaledVector(forward, dy * panSpeed);
      }
    } else {
      if (isDraggingRef.current) {
        const s = sphericalRef.current;
        s.theta -= dx * 0.008;
        s.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, s.phi - dy * 0.008));
      } else if (isPanningRef.current) {
        const panSpeed = 0.015;
        const forward = new THREE.Vector3(
          -Math.sin(sphericalRef.current.theta),
          0,
          -Math.cos(sphericalRef.current.theta)
        );
        const right = new THREE.Vector3(
          Math.cos(sphericalRef.current.theta),
          0,
          -Math.sin(sphericalRef.current.theta)
        );
        targetRef.current.addScaledVector(right, -dx * panSpeed);
        targetRef.current.addScaledVector(forward, dy * panSpeed);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const wasDraggingObject = isDraggingObjectRef.current;
    const wasPanning = isPanningRef.current;
    const isFreeHand = toolModeRef.current === 'pan' || isSpacePressedRef.current;

    isDraggingObjectRef.current = false;
    setIsDraggingObjectState(false);
    canDragSelectedItemRef.current = false;
    draggedItemIdRef.current = null;
    isDraggingRef.current = false;
    setIsDraggingLookState(false);
    isPanningRef.current = false;
    setIsPanningState(false);

    // If we were using the Free Hand tool, panning, or finishing a 3D drag, do not alter selection
    if (wasDraggingObject || isFreeHand || wasPanning) {
      return;
    }

    // Clean Click Selection & Synchronized Floor Focus in 3D
    if (!hasMovedPastThresholdRef.current) {
      const hit = findItemAtPointer(e.clientX, e.clientY);
      if (hit.floorLevel !== undefined && onFloorChange && hit.floorLevel !== activeFloorRef.current) {
        onFloorChange(hit.floorLevel);
      }

      // Check if user clicked on an interactive door or window to toggle its open/close state
      if (hit.id && hit.type === 'furniture') {
        const itemMesh = meshesGroupRef.current?.children.find((c) => c.userData?.id === hit.id);
        if (itemMesh) {
          itemMesh.traverse((child) => {
            if (child.userData && child.userData.isInteractive) {
              child.userData.isOpenManually = !child.userData.isOpenManually;
            }
          });
        }
      }

      if (cameraModeRef.current === 'aerial') {
        if (hit.id && (hit.type === 'furniture' || hit.type === 'wall')) {
          onSelectId(hit.id);
        } else {
          onSelectId(null); // Clicked on floor pad/sign/sky -> clear item selection cleanly
        }
      }
    }
  };

  // HTML5 Drag and Drop Handlers for dragging Catalog Items onto the 3D Viewport
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCatalog) {
      setIsDragOverCatalog(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverCatalog(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCatalog(false);

    let itemData: CatalogItem | null = null;
    try {
      const json = e.dataTransfer.getData('application/json');
      if (json) {
        itemData = JSON.parse(json);
      }
    } catch (err) {
      console.warn('Failed to parse dropped catalog item in 3D view', err);
    }

    if (!itemData) return;
    if (!cameraRef.current || !canvasMountRef.current || !onUpdatePlanRef.current) return;

    const rect = canvasMountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const allFloors = planRef.current.floors && planRef.current.floors.length > 0 ? planRef.current.floors : [
      { level: 0, name: 'Ground Floor' },
      { level: 1, name: '1st Floor' },
    ];
    const getFloor3DOffset = (level: number = 0) => {
      if (floor3DMode === 'isolated') {
        return { x: 0, y: 0, z: 0 };
      } else if (floor3DMode === 'sideBySide') {
        const floorIdx = allFloors.findIndex((fl) => fl.level === level);
        const validIdx = floorIdx >= 0 ? floorIdx : 0;
        const mid = (allFloors.length - 1) / 2;
        return { x: (validIdx - mid) * 13.0, y: 0, z: 0 };
      } else {
        return { x: 0, y: level * 2.5, z: 0 };
      }
    };

    const offset = getFloor3DOffset(activeFloor || 0);
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -offset.y);
    const hitPoint = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
      const targetWorldX = hitPoint.x - offset.x;
      const targetWorldZ = hitPoint.z - offset.z;
      const snappedX = Math.round((targetWorldX * 100) / 5) * 5;
      const snappedY = Math.round((targetWorldZ * 100) / 5) * 5;

      const currentPlan = planRef.current;
      const isDroppedCeiling =
        itemData.placementType === 'ceiling' ||
        (itemData.category || '').toLowerCase().includes('ceiling') ||
        (itemData.name || '').toLowerCase().includes('pendant') ||
        (itemData.name || '').toLowerCase().includes('chandelier') ||
        (itemData.name || '').toLowerCase().includes('ceiling fan') ||
        (itemData.name || '').toLowerCase().includes('downlight') ||
        (itemData.name || '').toLowerCase().includes('flush');

      const droppedElevation = isDroppedCeiling ? Math.max(120, 250 - (itemData.height || 50)) : 0;

      let newItem: FurnitureItem = {
        id: `f_${Date.now()}`,
        catalogId: itemData.id,
        name: itemData.name,
        category: itemData.category,
        x: snappedX,
        y: snappedY,
        elevation: droppedElevation,
        width: itemData.width,
        depth: itemData.depth,
        height: itemData.height,
        angle: 0,
        color: itemData.defaultColor,
        model: itemData.model,
        roughness: itemData.roughness,
        metalness: itemData.metalness,
        opacity: itemData.opacity,
        floorLevel: activeFloor,
        isVisible: true,
        isLocked: false,
        placementType: itemData.placementType || 'floor',
        placeOnTable:
          itemData.placeOnTable ||
          itemData.placementType === 'tabletop',
        allowedOnFloor:
          itemData.allowedOnFloor !== undefined
            ? itemData.allowedOnFloor
            : itemData.placementType !== 'tabletop',
      };

      if (isTabletopItem(newItem)) {
        const attachResult = autoAttachToTabletop(newItem, currentPlan.furniture);
        newItem = {
          ...newItem,
          elevation: attachResult.targetElevation,
          hostFurnitureId: attachResult.host ? attachResult.host.id : undefined,
        };
      }

      onUpdatePlanRef.current({
        ...currentPlan,
        furniture: [...currentPlan.furniture, newItem],
        updatedAt: new Date().toISOString(),
      });
      onSelectId(newItem.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (cameraMode === 'visitor') {
      const forward = new THREE.Vector3(
        Math.sin(visitorYawRef.current),
        0,
        -Math.cos(visitorYawRef.current)
      );
      visitorPosRef.current.addScaledVector(forward, e.deltaY < 0 ? 0.5 : -0.5);
    } else {
      // 3D ORBIT VIEW: ZOOM TOWARDS MOUSE CURSOR POSITION
      if (cameraRef.current && canvasMountRef.current) {
        const rect = canvasMountRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Find intersection with the floor plane or 3D object under mouse
        const curOffset = getFloor3DOffset(activeFloor || 0);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -curOffset.y);
        const hitPoint = new THREE.Vector3();
        let targetFocusPoint: THREE.Vector3 | null = null;

        if (meshesGroupRef.current) {
          const intersects = raycaster.intersectObjects(meshesGroupRef.current.children, true);
          if (intersects.length > 0) {
            targetFocusPoint = intersects[0].point;
          }
        }
        if (!targetFocusPoint && raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
          targetFocusPoint = hitPoint;
        }

        const zoomDelta = e.deltaY < 0 ? -1 : 1;
        const zoomFactor = zoomDelta < 0 ? 0.85 : 1.18;
        const oldRadius = sphericalRef.current.radius;
        const newRadius = Math.max(0.3, Math.min(120, oldRadius * zoomFactor));
        sphericalRef.current.radius = newRadius;

        // When zooming in towards cursor, gently shift orbit pivot towards cursor position
        if (targetFocusPoint && zoomDelta < 0) {
          const shiftFactor = 0.14;
          targetRef.current.x += (targetFocusPoint.x - targetRef.current.x) * shiftFactor;
          targetRef.current.y += (targetFocusPoint.y - targetRef.current.y) * shiftFactor;
          targetRef.current.z += (targetFocusPoint.z - targetRef.current.z) * shiftFactor;
        }
      }
    }
  };

  // Switch to Virtual Visitor mode and place in center of primary room on the currently selected floor
  const handleSwitchToVisitor = () => {
    setCameraMode('visitor');
    onSelectId(null);

    const currentTargetFloor = activeFloorRef.current !== undefined ? activeFloorRef.current : (activeFloor || 0);
    const targetRoom = plan.rooms.find((r) => (r.floorLevel ?? 0) === currentTargetFloor) || plan.rooms[0];
    let initX = 0;
    let initZ = 0;
    if (targetRoom && targetRoom.points.length > 0) {
      initX = (targetRoom.points.reduce((acc, p) => acc + p.x, 0) / targetRoom.points.length) * 0.01;
      initZ = (targetRoom.points.reduce((acc, p) => acc + p.y, 0) / targetRoom.points.length) * 0.01;
    }
    visitorPosRef.current.set(initX, 1.6, initZ);
    visitorYawRef.current = 0;
    visitorPitchRef.current = 0;
    lastSentPosRef.current = { x: Math.round(initX * 100), y: Math.round(initZ * 100), yaw: 0 };

    if (onVisitorCameraChange) {
      onVisitorCameraChange({
        x: Math.round(initX * 100),
        y: Math.round(initZ * 100),
        yaw: 0,
        elevation: 160,
        floorLevel: currentTargetFloor,
      });
    }
  };

  // Teleport visitor to a specific room
  // React to parent targetRoomToFocus
  useEffect(() => {
    if (targetRoomToFocus) {
      handleTeleportToRoom(targetRoomToFocus);
    }
  }, [targetRoomToFocus]);

  const handleTeleportToRoom = (room: Room) => {
    onSelectId(null);
    if (room.floorLevel !== undefined && onFloorChange && room.floorLevel !== activeFloor) {
      onFloorChange(room.floorLevel);
    }
    let avgX = 0;
    let avgZ = 0;
    if (room && room.points && room.points.length > 0) {
      avgX = (room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length) * 0.01;
      avgZ = (room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length) * 0.01;
    }

    if (cameraMode === 'visitor') {
      visitorPosRef.current.set(avgX, 1.6, avgZ);
      visitorYawRef.current = 0;
      visitorPitchRef.current = 0;
      lastSentPosRef.current = { x: Math.round(avgX * 100), y: Math.round(avgZ * 100), yaw: 0 };

      if (onVisitorCameraChange) {
        onVisitorCameraChange({
          x: Math.round(avgX * 100),
          y: Math.round(avgZ * 100),
          yaw: 0,
          elevation: 160,
          floorLevel: room.floorLevel ?? activeFloor,
        });
      }
    } else {
      // In Orbit / Aerial mode, center camera view smoothly on the room
      targetRef.current.set(avgX, 0.8, avgZ);
    }
  };

  // Virtual D-pad Movement actions for mouse/touch
  const walkStep = (dir: 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight') => {
    const stepDist = 0.6; // 60cm step
    const forward = new THREE.Vector3(
      Math.sin(visitorYawRef.current),
      0,
      -Math.cos(visitorYawRef.current)
    );
    const right = new THREE.Vector3(
      Math.cos(visitorYawRef.current),
      0,
      Math.sin(visitorYawRef.current)
    );

    if (dir === 'forward') visitorPosRef.current.addScaledVector(forward, stepDist);
    if (dir === 'backward') visitorPosRef.current.addScaledVector(forward, -stepDist);
    if (dir === 'left') visitorPosRef.current.addScaledVector(right, -stepDist);
    if (dir === 'right') visitorPosRef.current.addScaledVector(right, stepDist);
    if (dir === 'turnLeft') visitorYawRef.current += Math.PI / 8;
    if (dir === 'turnRight') visitorYawRef.current -= Math.PI / 8;
  };

  // Auto-Frame 3D Camera around entire house bounding box
  const lastFitted3DPlanIdRef = useRef<string | null>(null);

  const fit3DCameraToPlan = useCallback(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    plan.walls.forEach((w) => {
      const x1 = w.xStart / 100;
      const z1 = w.yStart / 100;
      const x2 = w.xEnd / 100;
      const z2 = w.yEnd / 100;
      minX = Math.min(minX, x1, x2);
      maxX = Math.max(maxX, x1, x2);
      minZ = Math.min(minZ, z1, z2);
      maxZ = Math.max(maxZ, z1, z2);
    });
    plan.furniture.forEach((f) => {
      const fx = f.x / 100;
      const fz = f.y / 100;
      const hw = (f.width / 100) / 2;
      const hd = (f.depth / 100) / 2;
      minX = Math.min(minX, fx - hw);
      maxX = Math.max(maxX, fx + hw);
      minZ = Math.min(minZ, fz - hd);
      maxZ = Math.max(maxZ, fz + hd);
    });

    if (minX === Infinity || maxX === -Infinity) {
      minX = -3.5; maxX = 3.5; minZ = -2.5; maxZ = 2.5;
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const maxSpan = Math.max(spanX, spanZ, 4.0);

    // Optimal viewing radius in meters for isometric 3D perspective
    const optimalRadius = Math.max(8.0, Math.min(32.0, maxSpan * 1.45));

    sphericalRef.current = {
      radius: optimalRadius,
      theta: Math.PI / 4,
      phi: Math.PI / 3.2,
    };
    targetRef.current.set(centerX, 1.0, centerZ);
  }, [plan]);

  useEffect(() => {
    if (plan.id !== lastFitted3DPlanIdRef.current) {
      lastFitted3DPlanIdRef.current = plan.id;
      if (cameraMode !== 'visitor') {
        fit3DCameraToPlan();
      }
    }
  }, [plan.id, fit3DCameraToPlan, cameraMode]);

  const lastFitTrigger3DRef = useRef<number>(0);
  useEffect(() => {
    if (fitTrigger && fitTrigger !== lastFitTrigger3DRef.current && cameraMode !== 'visitor') {
      lastFitTrigger3DRef.current = fitTrigger;
      fit3DCameraToPlan();
    }
  }, [fitTrigger, cameraMode]);

  const handleResetCamera = () => {
    if (cameraMode === 'visitor') {
      handleSwitchToVisitor();
    } else {
      fit3DCameraToPlan();
    }
  };

  // 3D Quick Actions for Selected Furniture Item
  const selectedFurniture = plan.furniture.find((f) => f.id === selectedId);

  const handle3DRotate = (deltaAngle: number) => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (!item) return;
    const newAngle = ((item.angle || 0) + deltaAngle + Math.PI * 2) % (Math.PI * 2);
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) => (f.id === selectedId ? { ...f, angle: newAngle } : f)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DNudge = (dx: number, dy: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId ? { ...f, x: f.x + dx, y: f.y + dy } : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DElevation = (delta: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? { ...f, elevation: Math.max(0, (f.elevation || 0) + delta) }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DScale = (multiplier: number) => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (!item) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? {
              ...f,
              width: Math.max(10, Math.round(f.width * multiplier)),
              depth: Math.max(10, Math.round(f.depth * multiplier)),
              height: Math.max(10, Math.round(f.height * multiplier)),
            }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DResize = (dim: 'width' | 'depth' | 'height', delta: number) => {
    if (!selectedId || !onUpdatePlan) return;
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.map((f) =>
        f.id === selectedId
          ? {
              ...f,
              [dim]: Math.max(10, Math.round(f[dim] + delta)),
            }
          : f
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handle3DDelete = () => {
    if (!selectedId || !onUpdatePlan) return;
    const item = plan.furniture.find((f) => f.id === selectedId);
    if (item?.isLocked) {
      alert(`⚠️ Cannot delete "${item.name}": This item is LOCKED.\nPlease unlock it first before deleting.`);
      return;
    }
    onUpdatePlan({
      ...plan,
      furniture: plan.furniture.filter((f) => f.id !== selectedId),
      updatedAt: new Date().toISOString(),
    });
    onSelectId(null);
  };

  const handle3DDuplicate = () => {
    if (!selectedFurniture || !onUpdatePlan) return;
    const copy: FurnitureItem = {
      ...selectedFurniture,
      id: `f_${Date.now()}`,
      x: selectedFurniture.x + 30,
      y: selectedFurniture.y + 30,
    };
    onUpdatePlan({
      ...plan,
      furniture: [...plan.furniture, copy],
      updatedAt: new Date().toISOString(),
    });
    onSelectId(copy.id);
  };

  const isFreeHandActive = toolMode === 'pan' || isSpacePressed;

  return (
    <div
      className={`relative w-full h-full bg-slate-100 overflow-hidden select-none ${
        isFreeHandActive
          ? isPanningState
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : isDraggingObjectState
          ? 'cursor-grabbing'
          : isHoveringObject
          ? 'cursor-grab'
          : 'cursor-default'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Visual Guide Overlay when Dragging Catalog Item over 3D Viewport */}
      {isDragOverCatalog && (
        <div className="absolute inset-0 bg-sky-500/10 border-2 border-dashed border-sky-400 pointer-events-none z-30 flex items-center justify-center animate-in fade-in duration-150 backdrop-blur-2xs">
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-sky-300 text-sky-700 font-bold text-sm flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-sky-500 animate-bounce" />
            <span>Drop item here to place in 3D scene (Floor {activeFloor})</span>
          </div>
        </div>
      )}

      {/* Three.js Canvas Mount - Isolated */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* WebGL Context Loss / Error Graceful Recovery Screen */}
      {hasWebglError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white backdrop-blur-md">
          <AlertTriangle className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
          <h3 className="text-base font-bold mb-1">WebGL 3D Context Paused</h3>
          <p className="text-xs text-slate-300 max-w-sm mb-4">
            Your browser reached its GPU context limit. Click below to reclaim the 3D graphics engine.
          </p>
          <button
            onClick={() => {
              setHasWebglError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
          >
            Reload 3D Viewport
          </button>
        </div>
      )}

      {/* Top 3D Viewport Controls (Hidden in Customer Presentation Tour) */}
      {!isCustomerMode && (
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold">
        {cameraMode === 'visitor' ? (
          /* Sleek Minimal Bar in PUBG Tour: Orbit Return & Duplex */
          <>
            <button
              onClick={() => setCameraMode('aerial')}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-sky-600 text-white font-bold shadow-2xs hover:bg-sky-500 transition flex items-center gap-1 cursor-pointer"
              title="Return to Aerial Orbit View"
            >
              <Rotate3d className="w-3 h-3" />
              <span>Orbit View</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              onClick={() => setFloor3DMode(floor3DMode === 'stacked' ? 'isolated' : 'stacked')}
              className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 font-medium cursor-pointer ${
                floor3DMode === 'stacked'
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300'
              }`}
              title="Duplex multi-story mode"
            >
              <Building2 className="w-3 h-3" />
              <span>{floor3DMode === 'stacked' ? 'Duplex: ON' : 'Duplex: OFF'}</span>
            </button>
            <button
              onClick={() => setShowCeiling((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 font-medium cursor-pointer ${
                showCeiling
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300'
              }`}
              title={showCeiling ? "Remove Top (Cutaway open interior view)" : "Keep Top (Enclose ceiling & roof)"}
            >
              <Layers className="w-3 h-3" />
              <span>{showCeiling ? 'Top: ON' : 'Top: OFF'}</span>
            </button>
          </>
        ) : (
          /* Full Controls in Orbit Mode */
          <>
            {/* 3D Tool Mode: Select vs Free Hand Pan (Hidden in Split/SweetHome mode to prevent clutter) */}
            {!isSplitMode && (
              <>
                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setToolMode('select')}
                    className={`px-2 py-1 rounded-md text-[11px] transition flex items-center gap-1 cursor-pointer ${
                      toolMode === 'select'
                        ? 'bg-sky-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300'
                    }`}
                    title="Select & Move 3D Items (V)"
                  >
                    <MousePointer className="w-3 h-3" />
                    <span>Select</span>
                  </button>
                  <button
                    onClick={() => setToolMode('pan')}
                    className={`px-2 py-1 rounded-md text-[11px] transition flex items-center gap-1 cursor-pointer ${
                      toolMode === 'pan'
                        ? 'bg-sky-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300'
                    }`}
                    title="Free Hand / Pan View Tool (H or Hold Space)"
                  >
                    <Hand className="w-3 h-3" />
                    <span>Hand</span>
                  </button>
                </div>
                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
              </>
            )}

            {/* Camera Mode */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => {
                  setCameraMode('aerial');
                }}
                className="px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer bg-sky-600 text-white font-bold shadow-2xs"
                title="Aerial Orbit View"
              >
                <Rotate3d className="w-3 h-3" />
                <span>Orbit</span>
              </button>
              <button
                onClick={handleSwitchToVisitor}
                className="px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1.5 font-bold cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300"
                title="Walk Tour (WASD Walk, Shift Sprint, Mouse-Look)"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Walk Tour</span>
              </button>
            </div>

            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Duplex Multi-Story Stack */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setFloor3DMode(floor3DMode === 'stacked' ? 'isolated' : 'stacked')}
                className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 font-medium cursor-pointer ${
                  floor3DMode === 'stacked'
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300'
                }`}
                title="Attach Floors in 3D: Duplex multi-story mode"
              >
                <Building2 className="w-3 h-3" />
                <span>{floor3DMode === 'stacked' ? 'Duplex: ON' : 'Duplex: OFF'}</span>
              </button>

              {floor3DMode === 'stacked' && (
                <button
                  onClick={() => setNextFloorGap((prev) => (prev === 0 ? 0.8 : prev === 0.8 ? 1.6 : 0))}
                  className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 font-semibold cursor-pointer ${
                    nextFloorGap > 0
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                  title="Next Floor Attachment Gap View"
                >
                  <span>{nextFloorGap === 0 ? '0m' : `+${nextFloorGap.toFixed(1)}m`}</span>
                </button>
              )}
            </div>

            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Ceiling Toggle */}
            <button
              onClick={() => setShowCeiling((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-[11px] transition flex items-center gap-1 font-medium cursor-pointer ${
                showCeiling
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300'
              }`}
              title={showCeiling ? "Remove Top (Cutaway open interior view)" : "Keep Top (Enclose ceiling & roof)"}
            >
              <Layers className="w-3 h-3" />
              <span>{showCeiling ? 'Top: ON' : 'Top: OFF'}</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Zoom Controls */}
            <button
              onClick={() => {
                sphericalRef.current.radius = Math.max(0.3, sphericalRef.current.radius * 0.75);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sphericalRef.current.radius = Math.min(120, sphericalRef.current.radius * 1.25);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={fit3DCameraToPlan}
              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-600 hover:text-amber-800 rounded-lg transition cursor-pointer"
              title="Fit Entire House in 3D (Auto-Frame)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Snapshot Photo */}
            <button
              onClick={handleTakePhotoSnapshot}
              disabled={isCapturing}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-700 rounded-lg transition cursor-pointer"
              title="Take Photo Render (PNG)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Time of Day & Reset (Hidden in split/sweethome mode) */}
            {!isSplitMode && (
              <>
                <div className="flex items-center gap-1 pl-1 pr-1" title={`Sun Time: ${Math.floor(timeOfDay)}:${timeOfDay % 1 !== 0 ? '30' : '00'}`}>
                  <Sun className="w-3 h-3 text-amber-500" />
                  <input
                    type="range"
                    min="6"
                    max="22"
                    step="0.5"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                    className="w-10 accent-sky-600 h-1 bg-slate-200 rounded cursor-pointer"
                  />
                </div>

                {/* Reset Camera */}
                <button
                  onClick={handleResetCamera}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                  title="Reset Camera View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </>
        )}
      </div>
      )}

      {/* Room Jump Pills in Visitor Mode (Placed at bottom-24 right-4 above D-pad, never overlapping top bar) */}
      {!isCustomerMode && cameraMode === 'visitor' && plan.rooms.length > 0 && (
        <div className="absolute bottom-20 right-4 z-10 flex flex-wrap gap-1 max-w-xs justify-end pointer-events-auto">
          {plan.rooms
            .filter((r) => (r.floorLevel ?? 0) === activeFloor)
            .map((room) => (
              <button
                key={room.id}
                onClick={() => handleTeleportToRoom(room)}
                className="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-emerald-600 text-slate-700 hover:text-white text-[11px] font-medium border border-slate-200 shadow-sm backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{room.name}</span>
              </button>
            ))}
        </div>
      )}

      {/* Walk View Boundary Warning Alert */}
      {walkWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl border border-amber-400 text-xs animate-bounce">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{walkWarning}</span>
        </div>
      )}




      {/* PUBG Game HUD Overlay (Top Compass Ribbon, Crosshair, Stance, Keybinds, Floor Badge) */}
      {cameraMode === 'visitor' && (
        <PubgGameHud
          yaw={hudYaw}
          pitch={hudPitch}
          isDragging={isDraggingLookState}
          isSprinting={isSprintingState}
          isCrouching={isCrouching}
          isMoving={isMovingState}
          isSoundEnabled={isSoundEnabled}
          activeFloorLevel={activeFloor}
          currentRoomName={
            plan.rooms.find((r) => {
              if ((r.floorLevel ?? 0) !== activeFloor) return false;
              const pts = r.points;
              if (!pts || pts.length < 3) return false;
              const px = visitorPosRef.current.x * 100;
              const py = visitorPosRef.current.z * 100;
              let inside = false;
              for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
                const xi = pts[i].x, yi = pts[i].y;
                const xj = pts[j].x, yj = pts[j].y;
                const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
                if (intersect) inside = !inside;
              }
              return inside;
            })?.name
          }
          nearbyDoorPrompt={nearbyDoorPrompt}
          onToggleSound={() => setIsSoundEnabled(soundEngine.toggle())}
          isCustomerMode={isCustomerMode}
        />
      )}

      {/* On-Screen Touch / Mouse D-Pad */}
      {cameraMode === 'visitor' && (
        <div className="absolute bottom-16 right-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-700 p-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 select-none pointer-events-auto">
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
            Controls
          </span>
          <button
            onClick={() => walkStep('forward')}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 flex items-center justify-center transition active:scale-90 border border-slate-700 shadow-2xs cursor-pointer"
            title="Walk Forward (W or ↑)"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => walkStep('turnLeft')}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 flex items-center justify-center transition active:scale-90 border border-slate-700 shadow-2xs cursor-pointer"
              title="Turn Left (A or ←)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => walkStep('backward')}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 flex items-center justify-center transition active:scale-90 border border-slate-700 shadow-2xs cursor-pointer"
              title="Walk Backward (S or ↓)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => walkStep('turnRight')}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 flex items-center justify-center transition active:scale-90 border border-slate-700 shadow-2xs cursor-pointer"
              title="Turn Right (D or →)"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => walkStep('left')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 font-semibold cursor-pointer"
              title="Strafe Left"
            >
              Strafe L
            </button>
            <button
              onClick={() => walkStep('right')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 font-semibold cursor-pointer"
              title="Strafe Right"
            >
              Strafe R
            </button>
          </div>
        </div>
      )}

      {/* Floating 3D Pick & Drag / Visitor Instructions Banner (Aerial Mode only, hidden in split/sweethome mode) */}
      {!isCustomerMode && cameraMode !== 'visitor' && !isSplitMode && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-[11px] text-slate-600 pointer-events-none shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>
            {toolMode === 'pan' || isSpacePressed
              ? '🖐️ Free Hand Tool Active: Click and drag anywhere to pan the 3D scene smoothly (Press V or Click Select to exit)'
              : '3D Drag & Drop: Click and drag any furniture piece on the floor • Press R to rotate • Press H or Hold Space for Free Hand Pan'}
          </span>
        </div>
      )}

      {/* Cinematic 4K Render Studio Modal */}
      <RenderStudioModal
        isOpen={isRenderStudioOpen}
        onClose={() => setIsRenderStudioOpen(false)}
        onCaptureSnapshot={handleCaptureRenderStudioSnapshot}
        projectName={plan.name}
        activeFloor={activeFloor}
        onUpgradePrompt={onUpgradePrompt}
        isPro={isPro}
      />
    </div>
  );
};
