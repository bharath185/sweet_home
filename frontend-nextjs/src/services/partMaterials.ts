import * as THREE from 'three';
import { FurnitureItem } from '../types/plan';

export interface FurnitureSubPart {
  id: string;
  name: string;
  icon: string;
  defaultColor?: string;
}

/**
 * Returns the configurable sub-parts for a given furniture item based on its category,
 * name, and procedural archetype.
 */
export function getFurnitureSubParts(item: FurnitureItem): FurnitureSubPart[] {
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const model = (item.model || '').toLowerCase();

  if (
    model.includes(':table') ||
    model.includes('table') ||
    model.includes('desk') ||
    name.includes('table') ||
    name.includes('desk') ||
    cat.includes('table')
  ) {
    return [
      { id: 'top', name: 'Tabletop Surface', icon: '🪵' },
      { id: 'legs', name: 'Legs & Base Structure', icon: '🦿' },
    ];
  }

  if (
    model.includes(':sofa') ||
    model.includes('sofa') ||
    name.includes('sofa') ||
    name.includes('couch') ||
    name.includes('lounge') ||
    cat.includes('sofa')
  ) {
    return [
      { id: 'body', name: 'Main Frame & Backrest', icon: '🛋️' },
      { id: 'cushions', name: 'Seat Cushions', icon: '🪑' },
      { id: 'legs', name: 'Base Legs / Plinth', icon: '🦿' },
      { id: 'pillows', name: 'Accent Throw Pillows', icon: '✨' },
    ];
  }

  if (
    model.includes(':bed') ||
    model.includes('bed') ||
    cat.includes('bedroom') ||
    name.includes('bed')
  ) {
    return [
      { id: 'headboard', name: 'Headboard', icon: '🛏️' },
      { id: 'bedding', name: 'Linen & Duvet', icon: '🪶' },
      { id: 'frame', name: 'Platform Base Frame', icon: '🪵' },
      { id: 'pillows', name: 'Sleeping Pillows', icon: '☁️' },
    ];
  }

  if (
    model.includes(':chair') ||
    model.includes('chair') ||
    model.includes('armchair') ||
    name.includes('chair') ||
    name.includes('stool') ||
    name.includes('armchair') ||
    cat.includes('chair')
  ) {
    return [
      { id: 'seat', name: 'Upholstered Seat', icon: '🪑' },
      { id: 'backrest', name: 'Backrest', icon: '🪵' },
      { id: 'legs', name: 'Chair Legs', icon: '🦿' },
    ];
  }

  if (
    model.includes(':cabinet') ||
    model.includes('cabinet') ||
    cat.includes('kitchen') ||
    name.includes('cabinet') ||
    name.includes('credenza') ||
    name.includes('sideboard') ||
    name.includes('wardrobe') ||
    name.includes('shelf') ||
    name.includes('bookcase') ||
    name.includes('dresser')
  ) {
    return [
      { id: 'top', name: 'Countertop Slab', icon: '🪨' },
      { id: 'doors', name: 'Cabinet Doors & Drawers', icon: '🚪' },
      { id: 'frame', name: 'Cabinet Carcass Frame', icon: '🪵' },
      { id: 'handles', name: 'Hardware Handles', icon: '✨' },
    ];
  }

  if (
    model.includes(':stairs') ||
    model.includes('stair') ||
    cat.includes('stairs') ||
    name.includes('stair')
  ) {
    return [
      { id: 'treads', name: 'Step Treads', icon: '🪜' },
      { id: 'stringers', name: 'Structural Beams', icon: '🏗️' },
      { id: 'handrail', name: 'Handrail & Balusters', icon: '🪵' },
    ];
  }

  if (
    model.includes(':door') ||
    model.includes('door') ||
    cat.includes('door') ||
    name.includes('door')
  ) {
    return [
      { id: 'panel', name: 'Door Leaf Panel', icon: '🚪' },
      { id: 'frame', name: 'Architrave Frame', icon: '🪟' },
      { id: 'handle', name: 'Lever Handle / Lock', icon: '🗝️' },
    ];
  }

  if (
    model.includes(':lamp') ||
    model.includes('lamp') ||
    model.includes('light') ||
    cat.includes('lighting') ||
    name.includes('lamp') ||
    name.includes('light') ||
    name.includes('chandelier') ||
    name.includes('pendant')
  ) {
    return [
      { id: 'shade', name: 'Lampshade / Diffuser', icon: '💡' },
      { id: 'stem', name: 'Stem / Cord / Chain', icon: '🦯' },
      { id: 'base', name: 'Stand Base / Canopy', icon: '🔘' },
    ];
  }

  // Fallback generic 2-tone configuration for all other items
  return [
    { id: 'primary', name: 'Primary Body', icon: '🎨' },
    { id: 'accent', name: 'Accent Trim', icon: '✨' },
  ];
}

/**
 * Builds a map of THREE.MeshStandardMaterial for each sub-part of a furniture item.
 */
export function buildSubPartMaterials(
  item: FurnitureItem,
  baseMat: THREE.Material
): Record<string, THREE.Material> {
  const partColors = item.partColors || {};
  const subParts = getFurnitureSubParts(item);
  const result: Record<string, THREE.Material> = {};

  const baseStandard = baseMat instanceof THREE.MeshStandardMaterial ? baseMat : null;
  const defRoughness = baseStandard ? baseStandard.roughness : (item.roughness ?? 0.5);
  const defMetalness = baseStandard ? baseStandard.metalness : (item.metalness ?? 0.1);
  const defOpacity = baseStandard ? baseStandard.opacity : (item.opacity ?? 1.0);

  subParts.forEach((part) => {
    const customHex = partColors[part.id];
    if (customHex) {
      result[part.id] = new THREE.MeshStandardMaterial({
        color: new THREE.Color(customHex),
        roughness: defRoughness,
        metalness: defMetalness,
        opacity: defOpacity,
        transparent: defOpacity < 1.0,
      });
    } else {
      result[part.id] = baseMat;
    }
  });

  return result;
}

/**
 * Maps a sub-group name inside an OBJ 3D model (French or English standard)
 * to the corresponding FurnitureSubPart id.
 */
export function mapObjGroupToPartId(
  groupName: string,
  category?: string,
  itemName?: string
): string {
  const g = (groupName || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const n = (itemName || '').toLowerCase();

  // 1. Table
  if (g.includes('plateau') || g.includes('top') || g.includes('surface') || g.includes('tabletop')) return 'top';
  if (g.includes('pied') || g.includes('socle') || g.includes('leg') || g.includes('base') || g.includes('stand')) return 'legs';

  // 2. Chair vs Sofa
  const isChair = c.includes('chair') || n.includes('chair') || n.includes('stool') || n.includes('chaise');
  if (g.includes('assise') || g.includes('cushion') || g.includes('seat')) {
    return isChair ? 'seat' : 'cushions';
  }
  if (g.includes('dossier') || g.includes('backrest') || g.includes('back')) {
    return isChair ? 'backrest' : 'cushions';
  }
  if (g.includes('accoud') || g.includes('armrest') || g.includes('accoudoir')) return 'body';
  if (g.includes('coussin') || g.includes('pillow')) return 'pillows';

  // 3. Bed
  if (g.includes('matelas') || g.includes('mattress') || g.includes('bedding') || g.includes('couette')) return 'bedding';
  if (g.includes('tete') || g.includes('headboard')) return 'headboard';
  if (g.includes('bord') || g.includes('sommier') || g.includes('cadre') || g.includes('frame')) return 'frame';

  // 4. Cabinet / Wardrobe
  if (g.includes('porte') || g.includes('door') || g.includes('tiroir') || g.includes('drawer')) return 'doors';
  if (g.includes('poignee') || g.includes('handle') || g.includes('knob')) return 'handles';
  if (g.includes('corps') || g.includes('carcass') || g.includes('caisson') || g.includes('montant')) return 'frame';

  // 5. Stairs
  if (g.includes('marche') || g.includes('tread') || g.includes('step')) return 'treads';
  if (g.includes('cote') || g.includes('stringer') || g.includes('limon')) return 'stringers';
  if (g.includes('rampe') || g.includes('handrail') || g.includes('garde')) return 'handrail';

  // 6. Door
  if (g.includes('panneau') || g.includes('panel')) return 'panel';

  // 7. Lighting
  if (g.includes('abat') || g.includes('shade') || g.includes('diffus') || g.includes('globe') || g.includes('sphere')) return 'shade';
  if (g.includes('tube') || g.includes('cable') || g.includes('tige') || g.includes('stem')) return 'stem';

  return 'primary';
}
