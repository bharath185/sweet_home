'use client';

import { FurnitureItem, Wall, CollisionReport } from '../types/plan';
import { isTabletopItem, isSupportingSurface, findSupportingHost } from './tabletopAttachment';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  points: Point[];
}

/**
 * Computes 4 vertices of a rotated furniture item in 2D space, with optional margin inset
 */
function getFurniturePolygon(item: FurnitureItem, inset: number = 0): Polygon {
  const halfW = Math.max(1, (item.width - inset * 2) / 2);
  const halfD = Math.max(1, (item.depth - inset * 2) / 2);
  const angle = item.angle || 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const localCorners = [
    { x: -halfW, y: -halfD },
    { x: halfW, y: -halfD },
    { x: halfW, y: halfD },
    { x: -halfW, y: halfD },
  ];

  const points = localCorners.map((c) => ({
    x: item.x + c.x * cos - c.y * sin,
    y: item.y + c.x * sin + c.y * cos,
  }));

  return { points };
}

/**
 * Computes 4 vertices of a thick wall segment in 2D space
 */
function getWallPolygon(wall: Wall): Polygon {
  const dx = wall.xEnd - wall.xStart;
  const dy = wall.yEnd - wall.yStart;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    return { points: [{ x: wall.xStart, y: wall.yStart }] };
  }

  const halfT = (wall.thickness || 15) / 2;
  const nx = (-dy / len) * halfT;
  const ny = (dx / len) * halfT;

  return {
    points: [
      { x: wall.xStart + nx, y: wall.yStart + ny },
      { x: wall.xEnd + nx, y: wall.yEnd + ny },
      { x: wall.xEnd - nx, y: wall.yEnd - ny },
      { x: wall.xStart - nx, y: wall.yStart - ny },
    ],
  };
}

/**
 * Separating Axis Theorem (SAT) collision test between two convex polygons
 */
function doPolygonsIntersect(a: Polygon, b: Polygon): boolean {
  const polygons = [a, b];

  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let i1 = 0; i1 < polygon.points.length; i1++) {
      const i2 = (i1 + 1) % polygon.points.length;
      const p1 = polygon.points[i1];
      const p2 = polygon.points[i2];

      // Normal perpendicular vector to the edge
      const normal = {
        x: -(p2.y - p1.y),
        y: p2.x - p1.x,
      };

      // Normalize
      const len = Math.hypot(normal.x, normal.y);
      if (len === 0) continue;
      normal.x /= len;
      normal.y /= len;

      // Project polygon A onto normal
      let minA = Infinity;
      let maxA = -Infinity;
      for (const p of a.points) {
        const projected = normal.x * p.x + normal.y * p.y;
        if (projected < minA) minA = projected;
        if (projected > maxA) maxA = projected;
      }

      // Project polygon B onto normal
      let minB = Infinity;
      let maxB = -Infinity;
      for (const p of b.points) {
        const projected = normal.x * p.x + normal.y * p.y;
        if (projected < minB) minB = projected;
        if (projected > maxB) maxB = projected;
      }

      // Check if projections do not overlap
      if (maxA < minB || maxB < minA) {
        return false; // Separating axis found
      }
    }
  }

  return true; // No separating axis -> Polygons intersect
}

function isChairOrSeating(item: FurnitureItem): boolean {
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();
  return (
    cat.includes('chair') ||
    cat.includes('seating') ||
    name.includes('chair') ||
    name.includes('stool') ||
    name.includes('bench') ||
    name.includes('armchair')
  );
}

function isTableOrDesk(item: FurnitureItem): boolean {
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();
  return (
    cat.includes('table') ||
    cat.includes('desk') ||
    name.includes('table') ||
    name.includes('desk') ||
    name.includes('counter') ||
    name.includes('island')
  );
}

function isFloorCoveringOrStructural(item: FurnitureItem): boolean {
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();
  return (
    cat.includes('rug') ||
    cat.includes('carpet') ||
    cat.includes('mat') ||
    cat.includes('outdoor') ||
    cat.includes('stairs') ||
    cat.includes('structural') ||
    name.includes('rug') ||
    name.includes('carpet') ||
    name.includes('mat') ||
    name.includes('deck') ||
    name.includes('porch') ||
    name.includes('stair') ||
    item.height <= 5
  );
}

function isWallFixture(item: FurnitureItem): boolean {
  const name = item.name.toLowerCase();
  const cat = (item.category || '').toLowerCase();
  return (
    cat === 'doors & windows' ||
    cat === 'stairs & structural' ||
    item.placementType === 'wall' ||
    item.placementType === 'ceiling' ||
    name.includes('radiator') ||
    name.includes('sconce') ||
    name.includes('painting') ||
    name.includes('mirror') ||
    name.includes('deck') ||
    name.includes('stair')
  );
}

/**
 * Detects all collisions, invalid overlaps, and placement restrictions (like tabletop items on floor).
 */
export function detectCollisions(
  furniture: FurnitureItem[],
  walls: Wall[],
  activeFloor: number = 0
): CollisionReport {
  const collidingItemIds = new Set<string>();
  const reasons = new Map<string, string>();

  // Filter items for current floor level
  const floorFurniture = furniture.filter(
    (f) => (f.floorLevel ?? 0) === activeFloor
  );
  const floorWalls = walls.filter(
    (w) => (w.floorLevel ?? 0) === activeFloor
  );

  // Inset polygons by 2cm for furniture-to-furniture checks
  const furniturePolygons = new Map<string, Polygon>();
  floorFurniture.forEach((f) => {
    furniturePolygons.set(f.id, getFurniturePolygon(f, 2));
  });

  // Inset polygons by 4cm for furniture-to-wall checks to allow flush wall contact
  const furnitureWallPolygons = new Map<string, Polygon>();
  floorFurniture.forEach((f) => {
    furnitureWallPolygons.set(f.id, getFurniturePolygon(f, 4));
  });

  const wallPolygons = new Map<string, Polygon>();
  floorWalls.forEach((w) => {
    wallPolygons.set(w.id, getWallPolygon(w));
  });

  // 1. Tabletop & Ceiling Item Placement Restriction Check
  floorFurniture.forEach((f) => {
    if (isTabletopItem(f)) {
      const host = findSupportingHost(f, floorFurniture);
      // If no host table is underneath or elevation is 0 (on bare floor)
      if (!host || (f.elevation || 0) < ((host.elevation || 0) + host.height - 8)) {
        collidingItemIds.add(f.id);
        const reason = '⚠️ Tabletop item restricted from floor. Must be placed on a table or counter.';
        reasons.set(f.id, reasons.has(f.id) ? reasons.get(f.id) + '; ' + reason : reason);
      }
    } else if (f.placementType === 'ceiling') {
      if ((f.elevation || 0) < 150) {
        collidingItemIds.add(f.id);
        const reason = '⚠️ Ceiling fixture should be mounted at ceiling elevation (≥200cm), not placed on the floor.';
        reasons.set(f.id, reasons.has(f.id) ? reasons.get(f.id) + '; ' + reason : reason);
      }
    }
  });

  // 2. Furniture vs Furniture collision check
  for (let i = 0; i < floorFurniture.length; i++) {
    const f1 = floorFurniture[i];
    const poly1 = furniturePolygons.get(f1.id)!;

    for (let j = i + 1; j < floorFurniture.length; j++) {
      const f2 = floorFurniture[j];
      const poly2 = furniturePolygons.get(f2.id)!;

      // Allow floor coverings (rugs, decks, mats) to have other items on top
      if (isFloorCoveringOrStructural(f1) || isFloorCoveringOrStructural(f2)) {
        continue;
      }

      // Check if one item is a valid tabletop item resting ON TOP of a host table/surface
      const f1Bottom = f1.elevation || 0;
      const f1Top = f1Bottom + f1.height;
      const f2Bottom = f2.elevation || 0;
      const f2Top = f2Bottom + f2.height;

      const isF1TabletopOnF2 =
        isTabletopItem(f1) &&
        isSupportingSurface(f2) &&
        f1Bottom >= f2Top - 6;

      const isF2TabletopOnF1 =
        isTabletopItem(f2) &&
        isSupportingSurface(f1) &&
        f2Bottom >= f1Top - 6;

      // If valid tabletop resting relationship, skip collision between them!
      if (isF1TabletopOnF2 || isF2TabletopOnF1) {
        continue;
      }

      // Chair tucked into / pulled up to a dining table or desk: architectural clearance
      const isChairTablePair =
        (isChairOrSeating(f1) && isTableOrDesk(f2)) ||
        (isChairOrSeating(f2) && isTableOrDesk(f1));
      if (isChairTablePair) {
        continue;
      }

      // Check 3D vertical overlap
      const verticalOverlap = Math.max(f1Bottom, f2Bottom) < Math.min(f1Top, f2Top) - 2;

      if (verticalOverlap && doPolygonsIntersect(poly1, poly2)) {
        collidingItemIds.add(f1.id);
        collidingItemIds.add(f2.id);

        const reason1 = 'Overlap with ' + f2.name;
        const reason2 = 'Overlap with ' + f1.name;
        reasons.set(f1.id, reasons.has(f1.id) ? reasons.get(f1.id) + '; ' + reason1 : reason1);
        reasons.set(f2.id, reasons.has(f2.id) ? reasons.get(f2.id) + '; ' + reason2 : reason2);
      }
    }
  }

  // 3. Furniture vs Wall collision check (excluding Doors, Windows, Wall fixtures & Structural)
  for (const f of floorFurniture) {
    if (isWallFixture(f)) continue;

    const polyF = furnitureWallPolygons.get(f.id)!;

    for (const w of floorWalls) {
      const polyW = wallPolygons.get(w.id)!;
      if (doPolygonsIntersect(polyF, polyW)) {
        collidingItemIds.add(f.id);
        const reason = 'Intersects Wall (' + Math.round(w.thickness) + 'cm thickness)';
        reasons.set(f.id, reasons.has(f.id) ? reasons.get(f.id) + '; ' + reason : reason);
      }
    }
  }

  return {
    collidingItemIds,
    reasons,
    totalCollisions: collidingItemIds.size,
  };
}
