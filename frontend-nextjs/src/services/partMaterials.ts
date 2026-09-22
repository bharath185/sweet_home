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

  if (model.includes(':table') || cat.includes('living') && (name.includes('table') || name.includes('desk'))) {
    return [
      { id: 'top', name: 'Tabletop Surface', icon: '🪵' },
      { id: 'legs', name: 'Legs & Base Structure', icon: '🦿' },
    ];
  }

  if (model.includes(':sofa') || name.includes('sofa') || name.includes('couch') || name.includes('lounge')) {
    return [
      { id: 'body', name: 'Main Frame & Backrest', icon: '🛋️' },
      { id: 'cushions', name: 'Seat Cushions', icon: '🪑' },
      { id: 'legs', name: 'Base Legs / Plinth', icon: '🦿' },
      { id: 'pillows', name: 'Accent Throw Pillows', icon: '✨' },
    ];
  }

  if (model.includes(':bed') || cat.includes('bedroom') || name.includes('bed')) {
    return [
      { id: 'headboard', name: 'Headboard', icon: '🛏️' },
      { id: 'bedding', name: 'Linen & Duvet', icon: '🪶' },
      { id: 'frame', name: 'Platform Base Frame', icon: '🪵' },
      { id: 'pillows', name: 'Sleeping Pillows', icon: '☁️' },
    ];
  }

  if (model.includes(':chair') || name.includes('chair') || name.includes('stool')) {
    return [
      { id: 'seat', name: 'Upholstered Seat', icon: '🪑' },
      { id: 'backrest', name: 'Backrest', icon: '🪵' },
      { id: 'legs', name: 'Chair Legs', icon: '🦿' },
    ];
  }

  if (model.includes(':cabinet') || cat.includes('kitchen') || name.includes('cabinet') || name.includes('credenza') || name.includes('sideboard')) {
    return [
      { id: 'top', name: 'Countertop Slab', icon: '🪨' },
      { id: 'doors', name: 'Cabinet Doors & Drawers', icon: '🚪' },
      { id: 'frame', name: 'Cabinet Carcass Frame', icon: '🪵' },
      { id: 'handles', name: 'Hardware Handles', icon: '✨' },
    ];
  }

  if (model.includes(':stairs') || cat.includes('stairs') || name.includes('stair')) {
    return [
      { id: 'treads', name: 'Step Treads', icon: '🪜' },
      { id: 'stringers', name: 'Structural Beams', icon: '🏗️' },
      { id: 'handrail', name: 'Handrail & Balusters', icon: '🪵' },
    ];
  }

  if (model.includes(':door') || cat.includes('door') || name.includes('door')) {
    return [
      { id: 'panel', name: 'Door Leaf Panel', icon: '🚪' },
      { id: 'frame', name: 'Architrave Frame', icon: '🪟' },
      { id: 'handle', name: 'Lever Handle / Lock', icon: '🗝️' },
    ];
  }

  if (model.includes(':lamp') || cat.includes('lighting') || name.includes('lamp') || name.includes('light')) {
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
