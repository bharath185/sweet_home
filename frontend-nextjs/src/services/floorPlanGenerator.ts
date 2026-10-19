import { HomePlan, Wall, Room, FurnitureItem, FloorLevel, ProjectPreferences } from '../types/plan';

export interface RoomSelectionState {
  living: boolean;
  kitchen: boolean;
  dining: boolean;
  masterBed: boolean;
  guestBedCount: number; // 0, 1, 2, 3
  bathCount: number; // 1, 2, 3
  office: boolean;
  balcony: boolean;
  utility: boolean;
  foyer: boolean;
}

export interface HomePlanWizardConfig {
  projectName: string;
  floorsCount: 1 | 2 | 3;
  rooms: RoomSelectionState;
  scale: 'compact' | 'standard' | 'spacious';
  stylePreset?: 'modern' | 'transitional' | 'scandinavian';
  furnishingMode?: 'furnished' | 'shell'; // 'furnished' by default
  userId?: string;
}

// Generate unique IDs
function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateCustomHomePlan(config: HomePlanWizardConfig): HomePlan {
  const {
    projectName = 'My Custom Home',
    floorsCount = 1,
    rooms,
    scale = 'standard',
    furnishingMode = 'furnished',
    userId = 'user',
  } = config;

  const isFurnished = furnishingMode !== 'shell';

  // Scale multipliers
  const scaleMultiplier = scale === 'compact' ? 0.88 : (scale === 'spacious' ? 1.22 : 1.0);

  // Define Floors
  const floors: FloorLevel[] = [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 280 },
  ];
  if (floorsCount >= 2) {
    floors.push({ level: 1, name: 'First Floor', elevation: 280, height: 280 });
  }
  if (floorsCount >= 3) {
    floors.push({ level: 2, name: 'Second Floor / Penthouse', elevation: 560, height: 280 });
  }

  const walls: Wall[] = [];
  const planRooms: Room[] = [];
  const furniture: FurnitureItem[] = [];

  const wallThickExt = 20;
  const wallThickInt = 15;
  const wallHeight = 280;

  // Helper to add clean straight wall
  const addWall = (x1: number, y1: number, x2: number, y2: number, floorLevel: number, isExt = false) => {
    walls.push({
      id: uid('wall'),
      xStart: Math.round(x1),
      yStart: Math.round(y1),
      xEnd: Math.round(x2),
      yEnd: Math.round(y2),
      thickness: isExt ? wallThickExt : wallThickInt,
      height: wallHeight,
      color: '#f8fafc',
      floorLevel,
    });
  };

  // Helper to place furniture item
  const addFurn = (item: {
    catalogId: string;
    name: string;
    category: string;
    x: number;
    y: number;
    elevation?: number;
    angle?: number;
    width: number;
    depth: number;
    height: number;
    model: string;
    icon?: string;
    color?: string;
    floorLevel: number;
  }) => {
    if (!isFurnished) return;
    furniture.push({
      id: uid('furn'),
      catalogId: item.catalogId,
      name: item.name,
      category: item.category,
      x: Math.round(item.x),
      y: Math.round(item.y),
      elevation: item.elevation || 0,
      angle: item.angle || 0,
      width: item.width,
      depth: item.depth,
      height: item.height,
      model: item.model,
      icon: item.icon || `/models/${item.catalogId}.png`,
      color: item.color,
      floorLevel: item.floorLevel,
    });
  };

  // Helper to add a clean rectangular room with enclosing walls, doors and windows
  const addEnclosedRoom = (
    name: string,
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number,
    floorLevel: number,
    floorColor: string,
    hasDoor = true,
    doorPosition: 'bottom' | 'top' | 'left' | 'right' = 'bottom',
    hasWindow = true,
    windowSide: 'top' | 'bottom' | 'left' | 'right' = 'top'
  ) => {
    const x1 = Math.round(xMin);
    const y1 = Math.round(yMin);
    const x2 = Math.round(xMax);
    const y2 = Math.round(yMax);
    const area = Math.round(((Math.abs(x2 - x1) / 100) * (Math.abs(y2 - y1) / 100)) * 10) / 10;

    planRooms.push({
      id: uid('room'),
      name,
      floorLevel,
      points: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
      ],
      floorColor,
      ceilingColor: '#ffffff',
      ceilingHeight: wallHeight,
      areaSquareMeters: area,
    });

    // Add Door
    if (hasDoor) {
      let doorX = (x1 + x2) / 2;
      let doorY = y2;
      let angle = 0;

      if (doorPosition === 'bottom') {
        doorX = (x1 + x2) / 2;
        doorY = y2;
        angle = 0;
      } else if (doorPosition === 'top') {
        doorX = (x1 + x2) / 2;
        doorY = y1;
        angle = Math.PI;
      } else if (doorPosition === 'left') {
        doorX = x1;
        doorY = (y1 + y2) / 2;
        angle = Math.PI / 2;
      } else if (doorPosition === 'right') {
        doorX = x2;
        doorY = (y1 + y2) / 2;
        angle = -Math.PI / 2;
      }

      furniture.push({
        id: uid('door'),
        catalogId: 'door',
        name: `${name} Interior Door`,
        category: 'Doors & Windows',
        x: doorX,
        y: doorY,
        elevation: 0,
        angle,
        width: 90,
        depth: 15,
        height: 210,
        model: '/models/door.obj',
        icon: '/models/door.png',
        color: '#f8fafc',
        floorLevel,
      });
    }

    // Add Natural Daylight Window
    if (hasWindow) {
      let winX = (x1 + x2) / 2;
      let winY = y1;
      let winAngle = 0;

      if (windowSide === 'top') {
        winX = (x1 + x2) / 2;
        winY = y1;
        winAngle = 0;
      } else if (windowSide === 'bottom') {
        winX = (x1 + x2) / 2;
        winY = y2;
        winAngle = Math.PI;
      } else if (windowSide === 'left') {
        winX = x1;
        winY = (y1 + y2) / 2;
        winAngle = Math.PI / 2;
      } else if (windowSide === 'right') {
        winX = x2;
        winY = (y1 + y2) / 2;
        winAngle = -Math.PI / 2;
      }

      furniture.push({
        id: uid('window'),
        catalogId: 'window85x123',
        name: `${name} Casement Window`,
        category: 'Doors & Windows',
        x: winX,
        y: winY,
        elevation: 90,
        angle: winAngle,
        width: 120,
        depth: 15,
        height: 140,
        model: '/models/window85x123.obj',
        icon: '/models/window85x123.png',
        color: '#ffffff',
        floorLevel,
      });
    }
  };

  // =========================================================================
  // ARCHITECTURAL GENERATION ALGORITHM
  // =========================================================================

  if (floorsCount === 1) {
    // -----------------------------------------------------------------------
    // SINGLE FLOOR PLAN (Level 0)
    // -----------------------------------------------------------------------
    const halfW = Math.round(520 * scaleMultiplier);
    const halfH = Math.round(380 * scaleMultiplier);

    const xL = -halfW;
    const xR = halfW;
    const yT = -halfH;
    const yB = halfH;
    const xMid = Math.round(-30 * scaleMultiplier);

    // 1. Exterior Perimeter Walls
    addWall(xL, yT, xR, yT, 0, true);
    addWall(xR, yT, xR, yB, 0, true);
    addWall(xR, yB, xL, yB, 0, true);
    addWall(xL, yB, xL, yT, 0, true);

    // 2. Central Spine Wall dividing Public & Private zones
    addWall(xMid, yT, xMid, yB, 0, false);

    // --- PUBLIC ZONE (Right Side: x from xMid to xR) ---
    const yDivPublic = Math.round(yT + (yB - yT) * 0.55);

    // Living Room & Lounge (Front Right)
    if (rooms.living) {
      addEnclosedRoom('Living Room & Lounge', xMid, yDivPublic, xR, yB, 0, '#f8f4eb', false, 'top', true, 'bottom');

      const lcx = (xMid + xR) / 2;
      const lcy = (yDivPublic + yB) / 2;

      // 3-Seater Sofa
      addFurn({
        catalogId: 'sofa',
        name: 'Plush Linen 3-Seater Sofa',
        category: 'Living',
        x: lcx,
        y: lcy + 40,
        angle: Math.PI,
        width: 220,
        depth: 90,
        height: 85,
        model: '/models/sofa.obj',
        color: '#334155',
        floorLevel: 0,
      });

      // Coffee Table
      addFurn({
        catalogId: 'squareTable',
        name: 'Fluted Oak Center Coffee Table',
        category: 'Living',
        x: lcx,
        y: lcy - 20,
        angle: 0,
        width: 105,
        depth: 65,
        height: 44,
        model: '/models/squareTable.obj',
        color: '#c29f79',
        floorLevel: 0,
      });

      // Velvet Accent Armchair
      addFurn({
        catalogId: 'armchair',
        name: 'Velvet Recliner Armchair',
        category: 'Living',
        x: lcx + 115,
        y: lcy + 20,
        angle: -Math.PI / 3,
        width: 85,
        depth: 85,
        height: 82,
        model: '/models/armchair.obj',
        color: '#065f46',
        floorLevel: 0,
      });

      // TV Media Console Unit
      addFurn({
        catalogId: 'sideboardBuffet',
        name: 'Contemporary Low-Profile Media Credenza',
        category: 'Living',
        x: lcx,
        y: yDivPublic + 35,
        angle: 0,
        width: 170,
        depth: 45,
        height: 55,
        model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"solid_doors","hasLegs":true}',
        color: '#1e293b',
        floorLevel: 0,
      });

      // Potted Palm Plant
      addFurn({
        catalogId: 'plant',
        name: 'Potted Monstera Plant',
        category: 'Decor & Plants',
        x: xR - 45,
        y: yB - 45,
        width: 50,
        depth: 50,
        height: 125,
        model: '/models/plant.obj',
        floorLevel: 0,
      });
    }

    // Kitchen & Dining (Rear Right)
    const xDivKitchenDining = Math.round(xMid + (xR - xMid) * 0.52);
    if (rooms.kitchen) {
      addEnclosedRoom('Modular Kitchen', xMid, yT, xDivKitchenDining, yDivPublic, 0, '#f1f5f9', true, 'bottom', true, 'top');
      addWall(xDivKitchenDining, yT, xDivKitchenDining, yDivPublic, 0, false);

      const kcx = (xMid + xDivKitchenDining) / 2;
      const kcy = (yT + yDivPublic) / 2;

      // Arched Base Cabinet (Bespoke Kitchen Counter)
      addFurn({
        catalogId: 'kitchenArchedBase',
        name: 'Bespoke Arched Inset Base Cabinet',
        category: 'Kitchen',
        x: kcx - 45,
        y: yT + 35,
        angle: 0,
        width: 120,
        depth: 62,
        height: 88,
        model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
        color: '#4d6059',
        floorLevel: 0,
      });

      // Overhead Arched Reeded Glass Wall Cabinet
      addFurn({
        catalogId: 'kitchenArchedGlassWall',
        name: 'Parisian Arched Reeded Glass Wall Cabinet',
        category: 'Kitchen',
        x: kcx - 45,
        y: yT + 25,
        elevation: 140,
        angle: 0,
        width: 100,
        depth: 36,
        height: 85,
        model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"arched_glass","hasLegs":false,"hasCrown":true,"underLighting":true}',
        color: '#4d6059',
        floorLevel: 0,
      });

      // Induction Cooker Stove
      addFurn({
        catalogId: 'cooker',
        name: 'Ceramic Induction Cooker & Oven',
        category: 'Kitchen',
        x: kcx + 55,
        y: yT + 35,
        angle: 0,
        width: 75,
        depth: 65,
        height: 85,
        model: '/models/cooker.obj',
        color: '#0f172a',
        floorLevel: 0,
      });

      // Stainless Refrigerator
      addFurn({
        catalogId: 'refrigerator',
        name: 'French Door Double Refrigerator',
        category: 'Kitchen',
        x: xMid + 50,
        y: yT + 45,
        angle: 0,
        width: 90,
        depth: 75,
        height: 185,
        model: '/models/fridge.obj',
        color: '#cbd5e1',
        floorLevel: 0,
      });

      // Center Kitchen Island
      addFurn({
        catalogId: 'kitchenIslandArched',
        name: 'Fluted Arched Waterfall Kitchen Island',
        category: 'Kitchen',
        x: kcx,
        y: kcy + 30,
        angle: 0,
        width: 160,
        depth: 85,
        height: 90,
        model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
        color: '#c29f79',
        floorLevel: 0,
      });

      // 2 Bar Stools
      [-35, 35].forEach((sx) => {
        addFurn({
          catalogId: 'stool',
          name: 'Bar Counter Stool',
          category: 'Kitchen',
          x: kcx + sx,
          y: kcy + 85,
          angle: Math.PI,
          width: 42,
          depth: 42,
          height: 78,
          model: '/models/stool.obj',
          color: '#78350f',
          floorLevel: 0,
        });
      });
    }

    if (rooms.dining) {
      addEnclosedRoom('Dining Room', xDivKitchenDining, yT, xR, yDivPublic, 0, '#fbf9f5', false, 'bottom', true, 'top');

      const dcx = (xDivKitchenDining + xR) / 2;
      const dcy = (yT + yDivPublic) / 2;

      // Formal Dining Table
      addFurn({
        catalogId: 'squareTable',
        name: 'Formal Walnut Dining Table',
        category: 'Living',
        x: dcx,
        y: dcy,
        angle: 0,
        width: 170,
        depth: 95,
        height: 76,
        model: '/models/squareTable.obj',
        color: '#5c3d2e',
        floorLevel: 0,
      });

      // 4 Chairs
      [-42, 42].forEach((cx) => {
        addFurn({
          catalogId: 'chair',
          name: 'Velvet Dining Chair',
          category: 'Living',
          x: dcx + cx,
          y: dcy - 65,
          angle: 0,
          width: 46,
          depth: 46,
          height: 90,
          model: '/models/chair.obj',
          color: '#0284c7',
          floorLevel: 0,
        });
        addFurn({
          catalogId: 'chair',
          name: 'Velvet Dining Chair',
          category: 'Living',
          x: dcx + cx,
          y: dcy + 65,
          angle: Math.PI,
          width: 46,
          depth: 46,
          height: 90,
          model: '/models/chair.obj',
          color: '#0284c7',
          floorLevel: 0,
        });
      });

      // Chandelier
      addFurn({
        catalogId: 'pendantLamp',
        name: 'Brushed Brass Dining Chandelier',
        category: 'Lighting',
        x: dcx,
        y: dcy,
        elevation: 190,
        width: 55,
        depth: 55,
        height: 70,
        model: '/models/pendantLamp.obj',
        color: '#d4af37',
        floorLevel: 0,
      });
    }

    addWall(xMid, yDivPublic, xR, yDivPublic, 0, false);

    // Balcony / Terrace
    if (rooms.balcony) {
      const balcDepth = 150;
      addEnclosedRoom('Balcony Sun Terrace', xMid + 80, yB, xR - 80, yB + balcDepth, 0, '#e2e8f0', true, 'top', false, 'bottom');
      addWall(xMid + 80, yB + balcDepth, xR - 80, yB + balcDepth, 0, true);
      addWall(xMid + 80, yB, xMid + 80, yB + balcDepth, 0, true);
      addWall(xR - 80, yB, xR - 80, yB + balcDepth, 0, true);

      const bcx = (xMid + 80 + xR - 80) / 2;
      const bcy = yB + balcDepth / 2;

      addFurn({
        catalogId: 'roundTable',
        name: 'Outdoor Bistro Table',
        category: 'Living',
        x: bcx,
        y: bcy,
        width: 70,
        depth: 70,
        height: 72,
        model: '/models/roundTable.obj',
        color: '#78350f',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'chair',
        name: 'Outdoor Lounge Chair',
        category: 'Living',
        x: bcx - 50,
        y: bcy,
        angle: Math.PI / 2,
        width: 50,
        depth: 50,
        height: 80,
        model: '/models/chair.obj',
        color: '#065f46',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'chair',
        name: 'Outdoor Lounge Chair',
        category: 'Living',
        x: bcx + 50,
        y: bcy,
        angle: -Math.PI / 2,
        width: 50,
        depth: 50,
        height: 80,
        model: '/models/chair.obj',
        color: '#065f46',
        floorLevel: 0,
      });
    }

    // --- PRIVATE ZONE (Left Side: x from xL to xMid) ---
    const yDivPrivate1 = Math.round(yT + (yB - yT) * 0.52);

    // Master Bedroom Suite (Front Left)
    if (rooms.masterBed) {
      const xMasterBath = Math.round(xL + (xMid - xL) * 0.42);
      addEnclosedRoom('Master Bedroom Suite', xMasterBath, yDivPrivate1, xMid, yB, 0, '#f5efe6', true, 'right', true, 'bottom');

      const mcx = (xMasterBath + xMid) / 2;
      const mcy = (yDivPrivate1 + yB) / 2;

      // King Bed
      addFurn({
        catalogId: 'bed140x190',
        name: 'Master Upholstered King Bed',
        category: 'Bedroom',
        x: mcx,
        y: yDivPrivate1 + 105,
        angle: 0,
        width: 180,
        depth: 205,
        height: 110,
        model: '/models/bed140x190.obj',
        color: '#d97706',
        floorLevel: 0,
      });

      // 2 Nightstands & Lamps
      [-120, 120].forEach((nx) => {
        addFurn({
          catalogId: 'bedsideTable',
          name: 'Bedside Nightstand',
          category: 'Bedroom',
          x: mcx + nx,
          y: yDivPrivate1 + 45,
          width: 48,
          depth: 42,
          height: 55,
          model: '/models/bedsideTable.obj',
          color: '#5c3d2e',
          floorLevel: 0,
        });

        addFurn({
          catalogId: 'workLamp',
          name: 'Bedside Night Lamp',
          category: 'Lighting',
          x: mcx + nx,
          y: yDivPrivate1 + 45,
          elevation: 55,
          width: 28,
          depth: 28,
          height: 45,
          model: '/models/workLamp.obj',
          color: '#d4af37',
          floorLevel: 0,
        });
      });

      // Wardrobe along dividing wall
      addFurn({
        catalogId: 'wardrobe',
        name: '3-Door Mirrored Wardrobe',
        category: 'Storage',
        x: xMid - 35,
        y: mcy + 30,
        angle: -Math.PI / 2,
        width: 170,
        depth: 60,
        height: 210,
        model: '/models/wardrobe.obj',
        color: '#1e293b',
        floorLevel: 0,
      });

      // Master En-suite Bath
      if (rooms.bathCount >= 1) {
        addEnclosedRoom('Master En-suite Bath', xL, yDivPrivate1, xMasterBath, yB, 0, '#e0f2fe', true, 'right', true, 'left');
        addWall(xMasterBath, yDivPrivate1, xMasterBath, yB, 0, false);

        const bcx = (xL + xMasterBath) / 2;
        addFurn({
          catalogId: 'washbasinWithCabinet',
          name: 'Vanity Washbasin Unit',
          category: 'Bathroom',
          x: bcx,
          y: yDivPrivate1 + 35,
          angle: 0,
          width: 90,
          depth: 55,
          height: 85,
          model: '/models/washbasinWithCabinet.obj',
          color: '#ffffff',
          floorLevel: 0,
        });

        addFurn({
          catalogId: 'toiletUnit',
          name: 'Wall-Hung Modern Toilet',
          category: 'Bathroom',
          x: xL + 38,
          y: (yDivPrivate1 + yB) / 2,
          angle: Math.PI / 2,
          width: 45,
          depth: 65,
          height: 80,
          model: '/models/toiletUnit.obj',
          color: '#ffffff',
          floorLevel: 0,
        });

        addFurn({
          catalogId: 'bath',
          name: 'Freestanding Spa Bathtub',
          category: 'Bathroom',
          x: bcx,
          y: yB - 45,
          angle: 0,
          width: 165,
          depth: 80,
          height: 60,
          model: '/models/bath.obj',
          color: '#ffffff',
          floorLevel: 0,
        });
      }
    }

    addWall(xL, yDivPrivate1, xMid, yDivPrivate1, 0, false);

    // Rear Left Zone (Guest Bed / Kids / Office / Bath 2)
    const xDivRear = Math.round(xL + (xMid - xL) * 0.58);
    if (rooms.guestBedCount > 0) {
      addEnclosedRoom(rooms.guestBedCount > 1 ? 'Bedroom 2 (Guest Suite)' : 'Secondary Bedroom', xL, yT, xDivRear, yDivPrivate1, 0, '#faf5f0', true, 'bottom', true, 'top');
      addWall(xDivRear, yT, xDivRear, yDivPrivate1, 0, false);

      const gcx = (xL + xDivRear) / 2;
      addFurn({
        catalogId: 'bed140x190',
        name: 'Queen Size Guest Bed',
        category: 'Bedroom',
        x: gcx,
        y: yT + 105,
        angle: 0,
        width: 160,
        depth: 200,
        height: 100,
        model: '/models/bed140x190.obj',
        color: '#475569',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'bedsideTable',
        name: 'Guest Bedside Stand',
        category: 'Bedroom',
        x: gcx + 105,
        y: yT + 45,
        width: 48,
        depth: 42,
        height: 55,
        model: '/models/bedsideTable.obj',
        color: '#5c3d2e',
        floorLevel: 0,
      });
    }

    if (rooms.office) {
      addEnclosedRoom('Home Office & Study', xDivRear, yT, xMid, Math.round(yT + (yDivPrivate1 - yT) * 0.65), 0, '#f8fafc', true, 'bottom', true, 'top');
      addWall(xDivRear, Math.round(yT + (yDivPrivate1 - yT) * 0.65), xMid, Math.round(yT + (yDivPrivate1 - yT) * 0.65), 0, false);

      const ocx = (xDivRear + xMid) / 2;
      const ocy = (yT + yT + (yDivPrivate1 - yT) * 0.65) / 2;

      addFurn({
        catalogId: 'desk',
        name: 'Executive Timber Desk',
        category: 'Office',
        x: ocx,
        y: ocy - 10,
        angle: 0,
        width: 140,
        depth: 70,
        height: 75,
        model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":3.5,"legThickness":4,"bevel":true}',
        color: '#271c19',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'officeChair',
        name: 'Ergonomic Executive Swivel Chair',
        category: 'Office',
        x: ocx,
        y: ocy + 38,
        angle: Math.PI,
        width: 62,
        depth: 62,
        height: 105,
        model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"solid_panel","legStyle":"swivel_pedestal"}',
        color: '#1e293b',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'bookcase',
        name: 'Floor-to-Ceiling Bookcase',
        category: 'Office',
        x: xMid - 25,
        y: ocy,
        angle: -Math.PI / 2,
        width: 95,
        depth: 38,
        height: 190,
        model: '/models/bookcase.obj',
        color: '#5c3d2e',
        floorLevel: 0,
      });
    }

    if (rooms.bathCount >= 2) {
      const bath2Top = rooms.office ? Math.round(yT + (yDivPrivate1 - yT) * 0.65) : yT;
      addEnclosedRoom('Guest Bathroom', xDivRear, bath2Top, xMid, yDivPrivate1, 0, '#e0e7ff', true, 'left', true, 'right');

      const gbcx = (xDivRear + xMid) / 2;
      const gbcy = (bath2Top + yDivPrivate1) / 2;

      addFurn({
        catalogId: 'washbasinWithCabinet',
        name: 'Powder Room Vanity',
        category: 'Bathroom',
        x: gbcx,
        y: bath2Top + 30,
        angle: 0,
        width: 80,
        depth: 50,
        height: 85,
        model: '/models/washbasinWithCabinet.obj',
        color: '#ffffff',
        floorLevel: 0,
      });

      addFurn({
        catalogId: 'toiletUnit',
        name: 'Guest Toilet',
        category: 'Bathroom',
        x: gbcx,
        y: yDivPrivate1 - 30,
        angle: Math.PI,
        width: 45,
        depth: 65,
        height: 80,
        model: '/models/toiletUnit.obj',
        color: '#ffffff',
        floorLevel: 0,
      });
    }

    // Main Entrance Door
    furniture.push({
      id: uid('main_entrance'),
      catalogId: 'door',
      name: 'Main Residence Entrance Door',
      category: 'Doors & Windows',
      x: Math.round(xMid + (xR - xMid) * 0.35),
      y: yT,
      elevation: 0,
      angle: Math.PI,
      width: 100,
      depth: 20,
      height: 220,
      model: '/models/door.obj',
      icon: '/models/door.png',
      color: '#1e293b',
      floorLevel: 0,
    });

  } else {
    // -----------------------------------------------------------------------
    // MULTI-FLOOR PLAN (2 or 3 FLOORS)
    // -----------------------------------------------------------------------
    const halfW = Math.round(540 * scaleMultiplier);
    const halfH = Math.round(400 * scaleMultiplier);

    const xL = -halfW;
    const xR = halfW;
    const yT = -halfH;
    const yB = halfH;
    const xMid = 0;

    // =======================================================================
    // FLOOR 0: GROUND LEVEL (Public Living, Dining, Kitchen, Powder, Stairs)
    // =======================================================================
    addWall(xL, yT, xR, yT, 0, true);
    addWall(xR, yT, xR, yB, 0, true);
    addWall(xR, yB, xL, yB, 0, true);
    addWall(xL, yB, xL, yT, 0, true);

    // Ground Living Room (Left Half)
    addEnclosedRoom('Grand Living & Reception Lounge', xL, yT, xMid, yB, 0, '#fbf7f0', false, 'right', true, 'left');
    addWall(xMid, yT, xMid, yB, 0, false);

    const glcx = (xL + xMid) / 2;
    const glcy = (yT + yB) / 2;

    // Grand Living Furniture
    addFurn({
      catalogId: 'sofa',
      name: 'Grand Sectional Living Sofa',
      category: 'Living',
      x: glcx - 20,
      y: glcy + 45,
      angle: Math.PI,
      width: 250,
      depth: 100,
      height: 85,
      model: '/models/sofa.obj',
      color: '#1e293b',
      floorLevel: 0,
    });

    addFurn({
      catalogId: 'squareTable',
      name: 'Calacatta Marble & Oak Coffee Table',
      category: 'Living',
      x: glcx - 20,
      y: glcy - 20,
      angle: 0,
      width: 120,
      depth: 70,
      height: 44,
      model: '/models/squareTable.obj',
      color: '#c29f79',
      floorLevel: 0,
    });

    addFurn({
      catalogId: 'armchair',
      name: 'Velvet Recliner Armchair',
      category: 'Living',
      x: glcx + 125,
      y: glcy + 25,
      angle: -Math.PI / 3,
      width: 90,
      depth: 90,
      height: 85,
      model: '/models/armchair.obj',
      color: '#065f46',
      floorLevel: 0,
    });

    addFurn({
      catalogId: 'sideboardBuffet',
      name: 'Living Room TV Media Credenza',
      category: 'Living',
      x: glcx - 20,
      y: yT + 35,
      angle: 0,
      width: 180,
      depth: 45,
      height: 55,
      model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"solid_doors","hasLegs":true}',
      color: '#334155',
      floorLevel: 0,
    });

    addFurn({
      catalogId: 'plant',
      name: 'Grand Foyer Palm Plant',
      category: 'Decor & Plants',
      x: xL + 45,
      y: yB - 45,
      width: 55,
      depth: 55,
      height: 135,
      model: '/models/plant.obj',
      floorLevel: 0,
    });

    // Ground Right: Kitchen, Dining, Powder Bath
    const yDivGround = Math.round(yT + (yB - yT) * 0.55);

    // Designer Chef Kitchen
    addEnclosedRoom('Designer Chef Kitchen & Island', xMid, yT, xR, yDivGround, 0, '#f1f5f9', true, 'bottom', true, 'top');
    addWall(xMid, yDivGround, xR, yDivGround, 0, false);

    const kcx = (xMid + xR) / 2;
    const kcy = (yT + yDivGround) / 2;

    // Arched Base Cabinet (Bespoke Kitchen Counter)
    addFurn({
      catalogId: 'kitchenArchedBase',
      name: 'Bespoke Arched Inset Base Cabinet',
      category: 'Kitchen',
      x: kcx - 50,
      y: yT + 35,
      angle: 0,
      width: 120,
      depth: 62,
      height: 88,
      model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
      color: '#4d6059',
      floorLevel: 0,
    });

    // Arched Reeded Glass Wall Cabinet
    addFurn({
      catalogId: 'kitchenArchedGlassWall',
      name: 'Parisian Arched Reeded Glass Wall Cabinet',
      category: 'Kitchen',
      x: kcx - 50,
      y: yT + 25,
      elevation: 140,
      angle: 0,
      width: 100,
      depth: 36,
      height: 85,
      model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"arched_glass","hasLegs":false,"hasCrown":true,"underLighting":true}',
      color: '#4d6059',
      floorLevel: 0,
    });

    // Induction Cooker
    addFurn({
      catalogId: 'cooker',
      name: 'Induction Range Stove & Oven',
      category: 'Kitchen',
      x: kcx + 55,
      y: yT + 35,
      angle: 0,
      width: 75,
      depth: 65,
      height: 85,
      model: '/models/cooker.obj',
      color: '#0f172a',
      floorLevel: 0,
    });

    // French Door Double Refrigerator
    addFurn({
      catalogId: 'refrigerator',
      name: 'French Door Double Refrigerator',
      category: 'Kitchen',
      x: xR - 50,
      y: yT + 45,
      angle: 0,
      width: 90,
      depth: 75,
      height: 185,
      model: '/models/fridge.obj',
      color: '#cbd5e1',
      floorLevel: 0,
    });

    // Center Arched Waterfall Island
    addFurn({
      catalogId: 'kitchenIslandArched',
      name: 'Fluted Arched Waterfall Kitchen Island',
      category: 'Kitchen',
      x: kcx,
      y: kcy + 30,
      angle: 0,
      width: 170,
      depth: 90,
      height: 90,
      model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
      color: '#c29f79',
      floorLevel: 0,
    });

    // 2 Island Bar Stools
    [-40, 40].forEach((sx) => {
      addFurn({
        catalogId: 'stool',
        name: 'Bar Counter Stool',
        category: 'Kitchen',
        x: kcx + sx,
        y: kcy + 85,
        angle: Math.PI,
        width: 42,
        depth: 42,
        height: 78,
        model: '/models/stool.obj',
        color: '#78350f',
        floorLevel: 0,
      });
    });

    // Formal Dining Salon
    addEnclosedRoom('Formal Dining Salon', xMid, yDivGround, xR - 180, yB, 0, '#fcfaf6', false, 'left', true, 'bottom');

    const dcx = (xMid + xR - 180) / 2;
    const dcy = (yDivGround + yB) / 2;

    addFurn({
      catalogId: 'squareTable',
      name: 'Formal Dining Table',
      category: 'Living',
      x: dcx,
      y: dcy,
      angle: 0,
      width: 180,
      depth: 95,
      height: 76,
      model: '/models/squareTable.obj',
      color: '#5c3d2e',
      floorLevel: 0,
    });

    [-45, 45].forEach((cx) => {
      addFurn({
        catalogId: 'chair',
        name: 'Dining Chair',
        category: 'Living',
        x: dcx + cx,
        y: dcy - 65,
        angle: 0,
        width: 46,
        depth: 46,
        height: 90,
        model: '/models/chair.obj',
        color: '#0284c7',
        floorLevel: 0,
      });
      addFurn({
        catalogId: 'chair',
        name: 'Dining Chair',
        category: 'Living',
        x: dcx + cx,
        y: dcy + 65,
        angle: Math.PI,
        width: 46,
        depth: 46,
        height: 90,
        model: '/models/chair.obj',
        color: '#0284c7',
        floorLevel: 0,
      });
    });

    addFurn({
      catalogId: 'pendantLamp',
      name: 'Dining Chandelier',
      category: 'Lighting',
      x: dcx,
      y: dcy,
      elevation: 190,
      width: 60,
      depth: 60,
      height: 80,
      model: '/models/pendantLamp.obj',
      color: '#d4af37',
      floorLevel: 0,
    });

    // Ground Floor Powder Room
    addEnclosedRoom('Ground Powder Room', xR - 180, yDivGround, xR, yB, 0, '#e2e8f0', true, 'left', true, 'right');
    addWall(xR - 180, yDivGround, xR - 180, yB, 0, false);

    addFurn({
      catalogId: 'washbasinWithCabinet',
      name: 'Powder Room Vanity Sink',
      category: 'Bathroom',
      x: xR - 90,
      y: yDivGround + 30,
      angle: 0,
      width: 80,
      depth: 50,
      height: 85,
      model: '/models/washbasinWithCabinet.obj',
      color: '#ffffff',
      floorLevel: 0,
    });

    addFurn({
      catalogId: 'toiletUnit',
      name: 'Modern Powder Toilet',
      category: 'Bathroom',
      x: xR - 90,
      y: yB - 35,
      angle: Math.PI,
      width: 45,
      depth: 65,
      height: 80,
      model: '/models/toiletUnit.obj',
      color: '#ffffff',
      floorLevel: 0,
    });

    // Ground Floor Staircase connecting to Level 1
    furniture.push({
      id: uid('stair_ground'),
      catalogId: 'staircase',
      name: 'Architectural Timber Staircase',
      category: 'Stairs & Structural',
      x: xMid - 60,
      y: yB - 140,
      elevation: 0,
      angle: 0,
      width: 120,
      depth: 260,
      height: 280,
      model: '/models/staircase.obj',
      icon: '/models/staircase.png',
      color: '#d4a373',
      floorLevel: 0,
    });

    // Main Entrance Door
    furniture.push({
      id: uid('main_door'),
      catalogId: 'door',
      name: 'Grand Pivot Entrance Door',
      category: 'Doors & Windows',
      x: xL + 160,
      y: yT,
      elevation: 0,
      angle: Math.PI,
      width: 110,
      depth: 20,
      height: 230,
      model: '/models/door.obj',
      icon: '/models/door.png',
      color: '#0f172a',
      floorLevel: 0,
    });

    // =======================================================================
    // FLOOR 1: FIRST FLOOR (Primary Master Suite, Bath, Bedrooms, Balcony)
    // =======================================================================
    addWall(xL, yT, xR, yT, 1, true);
    addWall(xR, yT, xR, yB, 1, true);
    addWall(xR, yB, xL, yB, 1, true);
    addWall(xL, yB, xL, yT, 1, true);

    const xHallL = -80;
    const xHallR = 80;
    addWall(xHallL, yT, xHallL, yB, 1, false);
    addWall(xHallR, yT, xHallR, yB, 1, false);

    addEnclosedRoom('Upper Mezzanine Gallery & Hall', xHallL, yT, xHallR, yB, 1, '#f1f5f9', false, 'bottom', true, 'top');

    // Primary Master Suite (Entire Left Wing)
    const yDivMaster = Math.round(yT + (yB - yT) * 0.65);
    addEnclosedRoom('Primary Master Suite', xL, yT, xHallL, yDivMaster, 1, '#fcf9f2', true, 'right', true, 'left');
    addWall(xL, yDivMaster, xHallL, yDivMaster, 1, false);

    const f1mcx = (xL + xHallL) / 2;
    const f1mcy = (yT + yDivMaster) / 2;

    addFurn({
      catalogId: 'bed140x190',
      name: 'Primary Presidential Master Bed',
      category: 'Bedroom',
      x: f1mcx,
      y: yT + 110,
      angle: 0,
      width: 190,
      depth: 210,
      height: 115,
      model: '/models/bed140x190.obj',
      color: '#d97706',
      floorLevel: 1,
    });

    [-125, 125].forEach((nx) => {
      addFurn({
        catalogId: 'bedsideTable',
        name: 'Master Bedside Table',
        category: 'Bedroom',
        x: f1mcx + nx,
        y: yT + 45,
        width: 50,
        depth: 45,
        height: 55,
        model: '/models/bedsideTable.obj',
        color: '#5c3d2e',
        floorLevel: 1,
      });

      addFurn({
        catalogId: 'workLamp',
        name: 'Brass Bedside Lamp',
        category: 'Lighting',
        x: f1mcx + nx,
        y: yT + 45,
        elevation: 55,
        width: 30,
        depth: 30,
        height: 50,
        model: '/models/workLamp.obj',
        color: '#d4af37',
        floorLevel: 1,
      });
    });

    addFurn({
      catalogId: 'wardrobe',
      name: 'Master Mirrored Wardrobe Dressing Wall',
      category: 'Storage',
      x: xL + 35,
      y: f1mcy + 30,
      angle: Math.PI / 2,
      width: 190,
      depth: 60,
      height: 220,
      model: '/models/wardrobe.obj',
      color: '#1e293b',
      floorLevel: 1,
    });

    // Spa Master Bathroom
    addEnclosedRoom('Spa Master Bathroom', xL, yDivMaster, xHallL, yB, 1, '#e0f2fe', true, 'right', true, 'bottom');

    addFurn({
      catalogId: 'bath',
      name: 'Spa Jacuzzi Bathtub',
      category: 'Bathroom',
      x: f1mcx,
      y: yB - 48,
      angle: 0,
      width: 180,
      depth: 90,
      height: 60,
      model: '/models/bath.obj',
      color: '#ffffff',
      floorLevel: 1,
    });

    addFurn({
      catalogId: 'washbasinWithCabinet',
      name: 'Double Porcelain Vanity Sink',
      category: 'Bathroom',
      x: f1mcx,
      y: yDivMaster + 35,
      angle: 0,
      width: 100,
      depth: 55,
      height: 85,
      model: '/models/washbasinWithCabinet.obj',
      color: '#ffffff',
      floorLevel: 1,
    });

    addFurn({
      catalogId: 'toiletUnit',
      name: 'Spa Toilet Unit',
      category: 'Bathroom',
      x: xL + 40,
      y: (yDivMaster + yB) / 2,
      angle: Math.PI / 2,
      width: 45,
      depth: 65,
      height: 80,
      model: '/models/toiletUnit.obj',
      color: '#ffffff',
      floorLevel: 1,
    });

    // Right Wing: Guest Bedroom 2
    const yDivRight = Math.round(yT + (yB - yT) * 0.52);
    addEnclosedRoom('Guest Bedroom 2', xHallR, yT, xR, yDivRight, 1, '#faf5f0', true, 'left', true, 'right');
    addWall(xHallR, yDivRight, xR, yDivRight, 1, false);

    const f1rcx = (xHallR + xR) / 2;

    addFurn({
      catalogId: 'bed140x190',
      name: 'Guest Queen Bed',
      category: 'Bedroom',
      x: f1rcx,
      y: yT + 105,
      angle: 0,
      width: 165,
      depth: 200,
      height: 100,
      model: '/models/bed140x190.obj',
      color: '#334155',
      floorLevel: 1,
    });

    addFurn({
      catalogId: 'bedsideTable',
      name: 'Bedside Nightstand',
      category: 'Bedroom',
      x: f1rcx + 110,
      y: yT + 45,
      width: 48,
      depth: 42,
      height: 55,
      model: '/models/bedsideTable.obj',
      color: '#5c3d2e',
      floorLevel: 1,
    });

    addFurn({
      catalogId: 'wardrobe',
      name: 'Guest Wardrobe Closet',
      category: 'Storage',
      x: xR - 35,
      y: (yT + yDivRight) / 2,
      angle: -Math.PI / 2,
      width: 150,
      depth: 60,
      height: 200,
      model: '/models/wardrobe.obj',
      color: '#1e293b',
      floorLevel: 1,
    });

    // Executive Office & Studio (or Bedroom 3)
    addEnclosedRoom(rooms.office ? 'Executive Office & Studio' : 'Bedroom 3 (Junior Suite)', xHallR, yDivRight, xR, yB, 1, '#f5efe6', true, 'left', true, 'right');

    const f1o_cy = (yDivRight + yB) / 2;

    if (rooms.office) {
      addFurn({
        catalogId: 'desk',
        name: 'Executive Workstation Desk',
        category: 'Office',
        x: f1rcx,
        y: f1o_cy - 10,
        angle: 0,
        width: 150,
        depth: 75,
        height: 75,
        model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":3.5,"legThickness":4,"bevel":true}',
        color: '#271c19',
        floorLevel: 1,
      });

      addFurn({
        catalogId: 'officeChair',
        name: 'Ergonomic Executive Swivel Chair',
        category: 'Office',
        x: f1rcx,
        y: f1o_cy + 40,
        angle: Math.PI,
        width: 65,
        depth: 65,
        height: 105,
        model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"solid_panel","legStyle":"swivel_pedestal"}',
        color: '#1e293b',
        floorLevel: 1,
      });

      addFurn({
        catalogId: 'bookcase',
        name: 'Executive Library Bookcase',
        category: 'Office',
        x: xR - 25,
        y: f1o_cy,
        angle: -Math.PI / 2,
        width: 110,
        depth: 40,
        height: 195,
        model: '/models/bookcase.obj',
        color: '#5c3d2e',
        floorLevel: 1,
      });
    } else {
      addFurn({
        catalogId: 'bed140x190',
        name: 'Junior Bedroom Suite Bed',
        category: 'Bedroom',
        x: f1rcx,
        y: yDivRight + 105,
        angle: 0,
        width: 150,
        depth: 200,
        height: 100,
        model: '/models/bed140x190.obj',
        color: '#065f46',
        floorLevel: 1,
      });
    }

    // Upper Balcony / Terrace
    if (rooms.balcony) {
      const balcDepth = 150;
      addEnclosedRoom('Panoramic Upper Balcony', xHallL, yB, xHallR, yB + balcDepth, 1, '#cbd5e1', true, 'top', false, 'bottom');
      addWall(xHallL, yB + balcDepth, xHallR, yB + balcDepth, 1, true);
      addWall(xHallL, yB, xHallL, yB + balcDepth, 1, true);
      addWall(xHallR, yB, xHallR, yB + balcDepth, 1, true);

      addFurn({
        catalogId: 'roundTable',
        name: 'Balcony Bistro Table',
        category: 'Living',
        x: 0,
        y: yB + balcDepth / 2,
        width: 70,
        depth: 70,
        height: 72,
        model: '/models/roundTable.obj',
        color: '#78350f',
        floorLevel: 1,
      });
    }

    // =======================================================================
    // FLOOR 2: SECOND FLOOR / PENTHOUSE (If 3 Floors Selected)
    // =======================================================================
    if (floorsCount >= 3) {
      addWall(xL + 60, yT + 60, xR - 60, yT + 60, 2, true);
      addWall(xR - 60, yT + 60, xR - 60, yB - 60, 2, true);
      addWall(xR - 60, yB - 60, xL + 60, yB - 60, 2, true);
      addWall(xL + 60, yB - 60, xL + 60, yT + 60, 2, true);

      addEnclosedRoom('Penthouse Sky Lounge & Observatory', xL + 60, yT + 60, 0, yB - 60, 2, '#f8fafc', true, 'right', true, 'left');
      addWall(0, yT + 60, 0, yB - 60, 2, false);

      const f2cx = (xL + 60) / 2;
      const f2cy = yT + (yB - yT) / 2;

      addFurn({
        catalogId: 'sofa',
        name: 'Sky Lounge Velvet Sofa',
        category: 'Living',
        x: f2cx,
        y: f2cy + 40,
        angle: Math.PI,
        width: 220,
        depth: 90,
        height: 85,
        model: '/models/sofa.obj',
        color: '#065f46',
        floorLevel: 2,
      });

      addFurn({
        catalogId: 'squareTable',
        name: 'Penthouse Cocktail Table',
        category: 'Living',
        x: f2cx,
        y: f2cy - 20,
        width: 100,
        depth: 60,
        height: 42,
        model: '/models/squareTable.obj',
        color: '#d4af37',
        floorLevel: 2,
      });

      addEnclosedRoom('Open-Air Rooftop Sun Terrace', 0, yT + 60, xR - 60, yB - 60, 2, '#e2e8f0', true, 'left', false, 'right');

      addFurn({
        catalogId: 'armchair',
        name: 'Rooftop Sun Lounger',
        category: 'Living',
        x: (xR - 60) / 2,
        y: f2cy,
        width: 75,
        depth: 180,
        height: 45,
        model: '/models/armchair.obj',
        color: '#ffffff',
        floorLevel: 2,
      });
    }
  }

  const preferences: ProjectPreferences = {
    unitSystem: 'cm',
    defaultWallThickness: wallThickInt,
    defaultWallHeight: wallHeight,
    gridSize: 20,
    magnetismEnabled: true,
    showRulers: true,
  };

  return {
    id: `plan_${userId}_${Date.now()}`,
    name: projectName,
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentFloor: 0,
    floors,
    walls,
    furniture,
    rooms: planRooms,
    dimensionLines: [],
    textNotes: [],
    preferences,
  };
}
