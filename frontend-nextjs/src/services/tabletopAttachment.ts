import { FurnitureItem, CatalogItem } from '../types/plan';

/**
 * Checks if a furniture item can act as a supporting host surface (Table, Desk, Counter, Cabinet, Nightstand, Shelf).
 */
export function isSupportingSurface(item: FurnitureItem): boolean {
  if (item.placementType === 'tabletop' || item.placeOnTable) return false;

  const name = (item.name || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();
  const id = (item.catalogId || '').toLowerCase();

  return (
    name.includes('table') ||
    name.includes('desk') ||
    name.includes('counter') ||
    name.includes('cabinet') ||
    name.includes('island') ||
    name.includes('sideboard') ||
    name.includes('console') ||
    name.includes('nightstand') ||
    name.includes('shelf') ||
    name.includes('bookcase') ||
    name.includes('unit') ||
    cat.includes('kitchen') ||
    id.includes('table') ||
    id.includes('desk') ||
    id.includes('cabinet') ||
    id.includes('tvunit') ||
    id.includes('bedside')
  );
}

/**
 * Checks if an item is designated to sit on a tabletop / counter.
 */
export function isTabletopItem(item: Partial<FurnitureItem> | Partial<CatalogItem>): boolean {
  if (item.placementType === 'tabletop' || item.placeOnTable === true) return true;
  
  const name = (item.name || '').toLowerCase();
  const rawCatId = 'catalogId' in item ? (item as any).catalogId : '';
  const id = (item.id || rawCatId || '').toLowerCase();
  
  // Specific on-table objects by default
  return (
    name.includes('table lamp') ||
    name.includes('desk lamp') ||
    name.includes('reading lamp') ||
    name.includes('vase') ||
    name.includes('laptop') ||
    name.includes('dinner set') ||
    name.includes('tableware') ||
    name.includes('tray') ||
    id.includes('tablelamp') ||
    id.includes('desklamp')
  );
}

/**
 * Checks if a point (x, y) is inside the 2D bounding area of a rotated furniture item.
 */
function isPointInsideItem(px: number, py: number, host: FurnitureItem): boolean {
  const halfW = host.width / 2;
  const halfD = host.depth / 2;
  const dx = px - host.x;
  const dy = py - host.y;
  const angle = -(host.angle || 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return Math.abs(localX) <= halfW + 5 && Math.abs(localY) <= halfD + 5;
}

/**
 * Finds the supporting table/counter host directly underneath the given item.
 */
export function findSupportingHost(
  item: FurnitureItem,
  furnitureList: FurnitureItem[]
): FurnitureItem | null {
  const currentFloor = item.floorLevel ?? 0;
  
  // Filter for valid host candidates on the same floor
  const hosts = furnitureList.filter(
    (f) => f.id !== item.id && (f.floorLevel ?? 0) === currentFloor && isSupportingSurface(f)
  );

  for (const host of hosts) {
    if (isPointInsideItem(item.x, item.y, host)) {
      return host;
    }
  }

  return null;
}

/**
 * Finds the nearest supporting table/surface on the same floor level.
 */
export function findNearestSupportingSurface(
  item: FurnitureItem,
  furnitureList: FurnitureItem[]
): FurnitureItem | null {
  const currentFloor = item.floorLevel ?? 0;
  const hosts = furnitureList.filter(
    (f) => f.id !== item.id && (f.floorLevel ?? 0) === currentFloor && isSupportingSurface(f)
  );

  if (hosts.length === 0) return null;

  let nearest: FurnitureItem | null = null;
  let minDistance = Infinity;

  for (const host of hosts) {
    const dist = Math.hypot(host.x - item.x, host.y - item.y);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = host;
    }
  }

  return nearest;
}

/**
 * Automatically calculates snap elevation and attachment details when placing/moving a tabletop item.
 */
export function autoAttachToTabletop(
  item: FurnitureItem,
  furnitureList: FurnitureItem[]
): {
  isAttached: boolean;
  host: FurnitureItem | null;
  targetElevation: number;
  isRestrictedFromFloor: boolean;
} {
  const isTabletop = isTabletopItem(item);
  if (!isTabletop) {
    return {
      isAttached: false,
      host: null,
      targetElevation: item.elevation || 0,
      isRestrictedFromFloor: false,
    };
  }

  const host = findSupportingHost(item, furnitureList);

  if (host) {
    const tableTopElevation = (host.elevation || 0) + host.height;
    return {
      isAttached: true,
      host,
      targetElevation: tableTopElevation,
      isRestrictedFromFloor: false,
    };
  }

  // Not on any table -> Restricted from floor!
  return {
    isAttached: false,
    host: null,
    targetElevation: 0,
    isRestrictedFromFloor: true,
  };
}
