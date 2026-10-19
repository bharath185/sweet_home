import { FurnitureItem, Wall, Room, HomePlan } from '../types/plan';

// ----------------------------------------------------
// Point-in-polygon test (Ray casting algorithm)
// ----------------------------------------------------
export function isPointInPolygon(x: number, y: number, points: { x: number; y: number }[]): boolean {
  if (!points || points.length < 3) return false;
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ----------------------------------------------------
// Find room containing or closest to point
// ----------------------------------------------------
export function findContainingRoom(x: number, y: number, rooms: Room[], floorLevel: number = 0): Room | null {
  const floorRooms = (rooms || []).filter((r) => (r.floorLevel ?? 0) === floorLevel);
  // 1. Direct containment test
  for (const r of floorRooms) {
    if (isPointInPolygon(x, y, r.points)) return r;
  }
  // 2. Nearest room centroid fallback
  let nearestRoom: Room | null = null;
  let minDist = Infinity;
  for (const r of floorRooms) {
    if (!r.points || r.points.length === 0) continue;
    const cx = r.points.reduce((acc, p) => acc + p.x, 0) / r.points.length;
    const cy = r.points.reduce((acc, p) => acc + p.y, 0) / r.points.length;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist < minDist) {
      minDist = dist;
      nearestRoom = r;
    }
  }
  return nearestRoom;
}

// ----------------------------------------------------
// 1. SNAP FURNITURE FLUSH TO NEAREST WALL
// Automatically rotates item so its back is against the wall,
// and its front faces inward into the room.
// ----------------------------------------------------
export function snapFurnitureToNearestWall(
  item: FurnitureItem,
  walls: Wall[],
  rooms: Room[] = []
): FurnitureItem {
  const floorLevel = item.floorLevel ?? 0;
  const floorWalls = (walls || []).filter((w) => (w.floorLevel ?? 0) === floorLevel);
  if (floorWalls.length === 0) return item;

  let bestWall: Wall | null = null;
  let minDist = Infinity;
  let bestT = 0.5;
  let bestProj = { x: item.x, y: item.y };

  for (const w of floorWalls) {
    const dx = w.xEnd - w.xStart;
    const dy = w.yEnd - w.yStart;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1) continue;

    // Projection parameter t
    const t = Math.max(0.05, Math.min(0.95, ((item.x - w.xStart) * dx + (item.y - w.yStart) * dy) / lenSq));
    const px = w.xStart + t * dx;
    const py = w.yStart + t * dy;
    const dist = Math.hypot(item.x - px, item.y - py);

    if (dist < minDist) {
      minDist = dist;
      bestWall = w;
      bestT = t;
      bestProj = { x: px, y: py };
    }
  }

  if (!bestWall) return item;

  const wdx = bestWall.xEnd - bestWall.xStart;
  const wdy = bestWall.yEnd - bestWall.yStart;
  const wallLen = Math.hypot(wdx, wdy);
  const wallAngle = Math.atan2(wdy, wdx);

  // Normal vectors perpendicular to the wall
  // Normal 1: 90 deg counter-clockwise
  const n1x = -wdy / wallLen;
  const n1y = wdx / wallLen;
  // Normal 2: 90 deg clockwise
  const n2x = wdy / wallLen;
  const n2y = -wdx / wallLen;

  // Determine which normal points towards the room / where the furniture currently is
  const toItemX = item.x - bestProj.x;
  const toItemY = item.y - bestProj.y;
  const dot1 = toItemX * n1x + toItemY * n1y;

  const inwardNx = dot1 >= 0 ? n1x : n2x;
  const inwardNy = dot1 >= 0 ? n1y : n2y;

  // Distance from wall centerline to furniture center:
  // (wallThickness / 2) + (item.depth / 2)
  const wallThick = bestWall.thickness || 15;
  const itemDepth = item.depth || 60;
  const offsetDist = wallThick / 2 + itemDepth / 2;

  const finalX = Math.round(bestProj.x + inwardNx * offsetDist);
  const finalY = Math.round(bestProj.y + inwardNy * offsetDist);

  // Orientation: Back against the wall, front facing into room (along inward normal)
  // Standard models have their front facing +Y in local space, so angle points towards the front
  let finalAngle = Math.atan2(inwardNy, inwardNx) - Math.PI / 2;

  // Normalize angle to [-PI, PI]
  while (finalAngle > Math.PI) finalAngle -= Math.PI * 2;
  while (finalAngle < -Math.PI) finalAngle += Math.PI * 2;

  return {
    ...item,
    x: finalX,
    y: finalY,
    angle: finalAngle,
  };
}

// ----------------------------------------------------
// 2. CENTER FURNITURE IN ROOM
// Places item at the geometric centroid of the room it is inside.
// ----------------------------------------------------
export function centerFurnitureInRoom(
  item: FurnitureItem,
  rooms: Room[]
): FurnitureItem {
  const floorLevel = item.floorLevel ?? 0;
  const hostRoom = findContainingRoom(item.x, item.y, rooms, floorLevel);
  if (!hostRoom || !hostRoom.points || hostRoom.points.length === 0) return item;

  // Centroid
  const cx = Math.round(hostRoom.points.reduce((acc, p) => acc + p.x, 0) / hostRoom.points.length);
  const cy = Math.round(hostRoom.points.reduce((acc, p) => acc + p.y, 0) / hostRoom.points.length);

  return {
    ...item,
    x: cx,
    y: cy,
  };
}

// ----------------------------------------------------
// 3. ROTATE FURNITURE BY 90 DEGREES
// ----------------------------------------------------
export function rotateFurnitureByAngle(
  item: FurnitureItem,
  deltaRad: number = Math.PI / 2
): FurnitureItem {
  let nextAngle = (item.angle || 0) + deltaRad;
  while (nextAngle > Math.PI) nextAngle -= Math.PI * 2;
  while (nextAngle < -Math.PI) nextAngle += Math.PI * 2;
  return {
    ...item,
    angle: nextAngle,
  };
}

// ----------------------------------------------------
// 4. ONE-CLICK AUTO-FURNISH & STYLE ROOM
// Generates perfectly coordinated and aligned interior sets
// ----------------------------------------------------
export type RoomStylePreset = 'arched_luxury' | 'scandi_light' | 'japandi' | 'urban_loft';

export function generateRoomStylePackage(
  room: Room,
  style: RoomStylePreset = 'arched_luxury'
): FurnitureItem[] {
  if (!room.points || room.points.length < 3) return [];

  const fl = room.floorLevel ?? 0;
  // Compute bounding box and centroid
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  room.points.forEach((p) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const roomW = maxX - minX;
  const roomH = maxY - minY;

  const lowerName = (room.name || '').toLowerCase();
  const isLiving = lowerName.includes('living') || lowerName.includes('lounge') || lowerName.includes('hall');
  const isKitchen = lowerName.includes('kitchen') || lowerName.includes('dining');
  const isBedroom = lowerName.includes('bed') || lowerName.includes('suite');
  const isBath = lowerName.includes('bath') || lowerName.includes('toilet') || lowerName.includes('powder');
  const isStudy = lowerName.includes('study') || lowerName.includes('office') || lowerName.includes('library') || lowerName.includes('work');
  const isOutdoor = lowerName.includes('garden') || lowerName.includes('veranda') || lowerName.includes('varandha') || lowerName.includes('balcony') || lowerName.includes('patio') || lowerName.includes('terrace') || lowerName.includes('courtyard') || lowerName.includes('lawn') || lowerName.includes('outdoor');

  const ts = Date.now();
  const items: FurnitureItem[] = [];

  if (isKitchen) {
    if (style === 'arched_luxury') {
      // 1. Arched Inset Base Cabinet along top wall
      items.push({
        id: `gen_kbase_${ts}`,
        catalogId: 'kitchenArchedBase',
        name: 'Bespoke Arched Inset Base Cabinet',
        category: 'Kitchen',
        x: cx - 40,
        y: minY + 35,
        angle: 0,
        width: 120,
        depth: 62,
        height: 88,
        elevation: 0,
        model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
        color: '#4d6059',
        floorLevel: fl,
      });

      // 2. Parisian Arched Reeded Glass Wall Cabinet above base
      items.push({
        id: `gen_kwall_${ts}`,
        catalogId: 'kitchenArchedGlassWall',
        name: 'Parisian Arched Reeded Glass Wall Cabinet',
        category: 'Kitchen',
        x: cx - 40,
        y: minY + 22,
        elevation: 140,
        angle: 0,
        width: 100,
        depth: 36,
        height: 85,
        model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"arched_glass","hasLegs":false,"hasCrown":true,"underLighting":true}',
        color: '#4d6059',
        floorLevel: fl,
      });

      // 3. Fluted Arched Waterfall Island in room center
      items.push({
        id: `gen_kisland_${ts}`,
        catalogId: 'kitchenIslandArched',
        name: 'Fluted Arched Waterfall Kitchen Island',
        category: 'Kitchen',
        x: cx,
        y: cy + 20,
        angle: 0,
        width: Math.min(180, roomW - 120),
        depth: 90,
        height: 90,
        elevation: 0,
        model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
        color: '#c29f79',
        floorLevel: fl,
      });

      // 4. Two Fluted Bouclé Bar Stools at Island
      items.push({
        id: `gen_kstool1_${ts}`,
        catalogId: 'kitchenBarStoolArched',
        name: 'Fluted Bouclé Bar Stool 1',
        category: 'Kitchen',
        x: cx - 40,
        y: cy + 85,
        angle: Math.PI,
        width: 45,
        depth: 45,
        height: 95,
        elevation: 0,
        model: 'procedural:chair:{"backrestStyle":"rounded_barrel","seatType":"cushioned","legStyle":"4_legs_corner"}',
        color: '#f5f5f0',
        floorLevel: fl,
      });
      items.push({
        id: `gen_kstool2_${ts}`,
        catalogId: 'kitchenBarStoolArched',
        name: 'Fluted Bouclé Bar Stool 2',
        category: 'Kitchen',
        x: cx + 40,
        y: cy + 85,
        angle: Math.PI,
        width: 45,
        depth: 45,
        height: 95,
        elevation: 0,
        model: 'procedural:chair:{"backrestStyle":"rounded_barrel","seatType":"cushioned","legStyle":"4_legs_corner"}',
        color: '#f5f5f0',
        floorLevel: fl,
      });

      // 5. Tall Arched Pantry Larder Tower in corner
      items.push({
        id: `gen_kpantry_${ts}`,
        catalogId: 'kitchenPantryArched',
        name: 'Grand Arched Parisian Pantry Larder Tower',
        category: 'Kitchen',
        x: minX + 45,
        y: minY + 45,
        angle: 0,
        width: 80,
        depth: 62,
        height: 220,
        elevation: 0,
        model: 'procedural:cabinet:{"columns":2,"rows":4,"doorType":"arched_glass","hasLegs":false,"hasCrown":true}',
        color: '#4d6059',
        floorLevel: fl,
      });
    } else {
      // Scandinavian / Minimalist Kitchen
      items.push({
        id: `gen_kbase_${ts}`,
        catalogId: 'kitchenArchedBase',
        name: 'Solid Oak Modular Base Counter',
        category: 'Kitchen',
        x: cx,
        y: minY + 35,
        angle: 0,
        width: Math.min(180, roomW - 80),
        depth: 60,
        height: 88,
        elevation: 0,
        model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"solid_doors","hasLegs":false,"countertop":true}',
        color: '#d4a373',
        floorLevel: fl,
      });
      items.push({
        id: `gen_ktable_${ts}`,
        catalogId: 'roundTable',
        name: 'Scandinavian Round Dining Table',
        category: 'Kitchen',
        x: cx,
        y: cy + 30,
        angle: 0,
        width: 100,
        depth: 100,
        height: 75,
        elevation: 0,
        model: 'procedural:table:{"shape":"round","legStyle":"pedestal_column"}',
        color: '#f5f5f0',
        floorLevel: fl,
      });
    }

  } else if (isBedroom) {
    // BEDROOM
    const bedColor = style === 'arched_luxury' ? '#4d6059' : '#d4a373';
    items.push({
      id: `gen_bed_${ts}`,
      catalogId: 'bed140x190',
      name: 'Luxury Tufted King Bed',
      category: 'Bedroom',
      x: cx,
      y: minY + 110,
      angle: 0,
      width: 180,
      depth: 200,
      height: 110,
      elevation: 0,
      model: 'procedural:bed:{"headboardStyle":"tufted","frameStyle":"platform"}',
      color: bedColor,
      floorLevel: fl,
    });

    // Nightstands
    items.push({
      id: `gen_stand_l_${ts}`,
      catalogId: 'sideTableEnd',
      name: 'Left Bedside Table',
      category: 'Bedroom',
      x: cx - 120,
      y: minY + 40,
      angle: 0,
      width: 48,
      depth: 42,
      height: 55,
      elevation: 0,
      model: 'procedural:table:{"shape":"rectangular","topThickness":2.5,"legThickness":3.5}',
      color: '#c29f79',
      floorLevel: fl,
    });
    items.push({
      id: `gen_stand_r_${ts}`,
      catalogId: 'sideTableEnd',
      name: 'Right Bedside Table',
      category: 'Bedroom',
      x: cx + 120,
      y: minY + 40,
      angle: 0,
      width: 48,
      depth: 42,
      height: 55,
      elevation: 0,
      model: 'procedural:table:{"shape":"rectangular","topThickness":2.5,"legThickness":3.5}',
      color: '#c29f79',
      floorLevel: fl,
    });

    // Wardrobe along opposite or side wall
    items.push({
      id: `gen_wardrobe_${ts}`,
      catalogId: 'wardrobeDouble',
      name: 'Full Height Double Wardrobe',
      category: 'Bedroom',
      x: minX + 45,
      y: cy + 40,
      angle: Math.PI / 2,
      width: 120,
      depth: 60,
      height: 210,
      elevation: 0,
      model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}',
      color: '#f1f5f9',
      floorLevel: fl,
    });

  } else if (isLiving) {
    // LIVING ROOM
    const sofaColor = style === 'arched_luxury' ? '#0f766e' : style === 'japandi' ? '#78716c' : '#334155';
    // 3-Seater Sofa facing center
    items.push({
      id: `gen_sofa_${ts}`,
      catalogId: 'sofa',
      name: 'Luxury 3-Seater Lounge Sofa',
      category: 'Living',
      x: cx,
      y: cy + 50,
      angle: Math.PI,
      width: Math.min(220, roomW - 80),
      depth: 95,
      height: 85,
      elevation: 0,
      model: '/models/sofa.obj',
      color: sofaColor,
      floorLevel: fl,
    });

    // Center Coffee Table
    items.push({
      id: `gen_ctable_${ts}`,
      catalogId: 'roundTable',
      name: 'Italian Carrara Marble Coffee Table',
      category: 'Living',
      x: cx,
      y: cy - 20,
      angle: 0,
      width: 90,
      depth: 90,
      height: 44,
      elevation: 0,
      model: '/models/roundTable.obj',
      color: '#f8fafc',
      floorLevel: fl,
    });

    // TV Credenza along top wall
    items.push({
      id: `gen_tvunit_${ts}`,
      catalogId: 'flutedCredenza',
      name: 'Arched Fluted Oak Media Credenza',
      category: 'Living',
      x: cx,
      y: minY + 35,
      angle: 0,
      width: Math.min(180, roomW - 80),
      depth: 45,
      height: 65,
      elevation: 0,
      model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":true}',
      color: '#c29f79',
      floorLevel: fl,
    });

    // Accent Lounge Armchair
    items.push({
      id: `gen_armchair_${ts}`,
      catalogId: 'armchair',
      name: 'Cream Bouclé Accent Armchair',
      category: 'Living',
      x: cx + 115,
      y: cy + 30,
      angle: -Math.PI / 3,
      width: 85,
      depth: 85,
      height: 82,
      elevation: 0,
      model: '/models/armchair.obj',
      color: '#f5f5f0',
      floorLevel: fl,
    });

    // Potted Floor Palm in corner
    items.push({
      id: `gen_palm_${ts}`,
      catalogId: 'plant',
      name: 'Fiddle Leaf Fig & Brass Planter',
      category: 'Decor & Plants',
      x: maxX - 45,
      y: minY + 45,
      angle: 0,
      width: 55,
      depth: 55,
      height: 140,
      elevation: 0,
      model: '/models/plant.obj',
      floorLevel: fl,
    });

  } else if (isBath) {
    // BATHROOM
    items.push({
      id: `gen_bath_${ts}`,
      catalogId: 'bath',
      name: 'Freestanding Oval Soak Tub',
      category: 'Bathroom',
      x: minX + 95,
      y: minY + 50,
      angle: 0,
      width: 170,
      depth: 80,
      height: 60,
      elevation: 0,
      model: '/models/bath.obj',
      color: '#ffffff',
      floorLevel: fl,
    });
    items.push({
      id: `gen_vanity_${ts}`,
      catalogId: 'kitchenArchedBase',
      name: 'Fluted Oak Vanity with Marble Top',
      category: 'Bathroom',
      x: maxX - 50,
      y: cy,
      angle: -Math.PI / 2,
      width: 90,
      depth: 55,
      height: 85,
      elevation: 0,
      model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
      color: '#c29f79',
      floorLevel: fl,
    });
    items.push({
      id: `gen_toilet_${ts}`,
      catalogId: 'toiletUnit',
      name: 'Wall-Hung Porcelain Toilet',
      category: 'Bathroom',
      x: minX + 35,
      y: maxY - 50,
      angle: Math.PI / 2,
      width: 45,
      depth: 65,
      height: 75,
      elevation: 0,
      model: 'procedural:toilet:{}',
      color: '#ffffff',
      floorLevel: fl,
    });
  } else if (isStudy) {
    items.push({
      id: `gen_desk_${ts}`,
      catalogId: 'squareTable',
      name: 'Executive Timber Desk',
      category: 'Bedroom',
      x: cx,
      y: cy,
      angle: 0,
      width: Math.min(140, roomW - 60),
      depth: 70,
      height: 75,
      elevation: 0,
      model: 'procedural:desk:{}',
      icon: '/models/squareTable.png',
      color: style === 'scandi_light' ? '#d4a373' : '#5c3d2e',
      floorLevel: fl,
    });
    items.push({
      id: `gen_chair_${ts}`,
      catalogId: 'chair',
      name: 'Ergonomic Swivel Task Chair',
      category: 'Bedroom',
      x: cx,
      y: cy + 50,
      angle: 0,
      width: 58,
      depth: 58,
      height: 95,
      elevation: 0,
      model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"cushioned","legStyle":"swivel_pedestal"}',
      icon: '/models/chair.png',
      color: '#1e293b',
      floorLevel: fl,
    });
    items.push({
      id: `gen_bookcase_${ts}`,
      catalogId: 'bookcase',
      name: 'Built-In Library Bookshelf',
      category: 'Storage',
      x: cx,
      y: minY + 25,
      angle: 0,
      width: Math.min(160, roomW - 40),
      depth: 38,
      height: 220,
      elevation: 0,
      model: '/models/bookcase.obj',
      icon: '/models/bookcase.png',
      color: '#334155',
      floorLevel: fl,
    });
  } else if (isOutdoor) {
    // 1. Garden Patio Bench / Lounge Seating
    items.push({
      id: `gen_bench_${ts}`,
      catalogId: 'chair',
      name: 'Teak Heritage Garden Patio Bench',
      category: 'Garden & Outdoor',
      x: cx,
      y: maxY - 40,
      angle: Math.PI,
      width: Math.min(150, roomW - 60),
      depth: 60,
      height: 85,
      elevation: 0,
      model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"wood_plank","legStyle":"straight_4"}',
      icon: '/models/chair.png',
      color: '#78350f',
      floorLevel: fl,
    });

    // 2. Centerpiece: Classic Stone Fountain or Raised Planter
    if (roomW >= 180 && roomH >= 180) {
      items.push({
        id: `gen_fountain_${ts}`,
        catalogId: 'roundTable',
        name: 'Classic Two-Tier Stone Garden Fountain',
        category: 'Garden & Outdoor',
        x: cx,
        y: cy - 20,
        angle: 0,
        width: 110,
        depth: 110,
        height: 130,
        elevation: 0,
        model: 'procedural:garden:{"type":"fountain"}',
        icon: '/models/roundTable.png',
        color: '#e2e8f0',
        floorLevel: fl,
      });
    }

    // 3. Palm or Japanese Maple in Corner Left
    items.push({
      id: `gen_tree1_${ts}`,
      catalogId: 'plant',
      name: style === 'japandi' ? 'Japanese Crimson Maple Tree' : 'Tropical Royal Palm Tree',
      category: 'Garden & Outdoor',
      x: minX + 50,
      y: minY + 50,
      angle: 0,
      width: 120,
      depth: 120,
      height: 240,
      elevation: 0,
      model: style === 'japandi' ? 'procedural:tree:{"type":"deciduous_tree","foliageStyle":"autumn_red"}' : 'procedural:tree:{"type":"palm"}',
      icon: '/models/plant.png',
      color: style === 'japandi' ? '#991b1b' : '#15803d',
      floorLevel: fl,
    });

    // 4. Blooming Hydrangea or Rose Bush in Corner Right
    items.push({
      id: `gen_bush_${ts}`,
      catalogId: 'plant',
      name: 'Blooming Purple Hydrangea Bush',
      category: 'Garden & Outdoor',
      x: maxX - 50,
      y: minY + 50,
      angle: 0,
      width: 85,
      depth: 85,
      height: 80,
      elevation: 0,
      model: 'procedural:garden:{"type":"flowering_bush","hasFlowers":true,"flowerColor":"#8b5cf6"}',
      icon: '/models/plant.png',
      color: '#15803d',
      floorLevel: fl,
    });
  }

  return items;
}
