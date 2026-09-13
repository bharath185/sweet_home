export type UserRole = 'ADMIN' | 'DESIGNER' | 'CLIENT';
export type UnitSystem = 'cm' | 'm' | 'mm' | 'ft_in';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnline: boolean;
  assignedPlan: string;
  createdAt: string;
}

export interface Wall {
  id: string;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  thickness: number;
  height: number;
  color?: string;
  texture?: string;
  floorLevel?: number;
  isColliding?: boolean;
}

export interface FurnitureItem {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  x: number; // in cm
  y: number; // in cm
  elevation: number; // in cm
  angle: number; // in radians
  width: number;
  depth: number;
  height: number;
  model: string;
  icon?: string;
  color?: string;
  texture?: string;
  materialCategory?: 'wood' | 'fabric' | 'leather' | 'metal' | 'stone' | 'glass' | 'custom';
  materialFinish?: string;
  roughness?: number; // 0.0 (mirror) to 1.0 (matte)
  metalness?: number; // 0.0 to 1.0
  opacity?: number; // 0.1 to 1.0
  stylePreset?: string;
  lightIntensity?: number;
  lightColor?: string;
  isLocked?: boolean;
  isVisible?: boolean;
  floorLevel?: number;
  isColliding?: boolean;
  collisionReason?: string;
  placementType?: 'floor' | 'tabletop' | 'wall' | 'ceiling';
  placeOnTable?: boolean;
  hostFurnitureId?: string;
  allowedOnFloor?: boolean;
}

export interface Room {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  floorColor?: string;
  floorTexture?: string;
  ceilingColor?: string;
  areaSquareMeters?: number;
  floorLevel?: number;
}

export interface DimensionLine {
  id: string;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  offset: number;
  floorLevel?: number;
  text?: string;
}

export interface TextNote {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: string;
  floorLevel?: number;
}

export interface BlueprintImage {
  url: string;
  name: string;
  x: number; // in cm
  y: number; // in cm
  width: number; // in cm
  height: number; // in cm
  opacity: number; // 0.1 to 1.0
  isVisible: boolean;
  isLocked: boolean;
}

export interface ProjectPreferences {
  unitSystem: UnitSystem;
  defaultWallThickness: number; // in cm
  defaultWallHeight: number; // in cm
  gridSize: number; // in cm
  magnetismEnabled: boolean;
  showRulers: boolean;
}

export interface FloorLevel {
  level: number;
  name: string;
  elevation: number; // in cm
  height: number; // in cm
}

export interface HomePlan {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  currentFloor: number;
  floors: FloorLevel[];
  walls: Wall[];
  furniture: FurnitureItem[];
  rooms: Room[];
  dimensionLines: DimensionLine[];
  textNotes: TextNote[];
  blueprint?: BlueprintImage;
  preferences: ProjectPreferences;
  assignedToUserId?: string;
  environment?: {
    timeOfDay: number; // 0 to 24
    sunlightIntensity: number;
    ambientColor: string;
    skybox: 'clear' | 'sunset' | 'night' | 'studio';
  };
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  width: number;
  depth: number;
  height: number;
  model: string;
  icon: string;
  defaultColor?: string;
  materialCategory?: 'wood' | 'fabric' | 'leather' | 'metal' | 'stone' | 'glass' | 'custom';
  materialFinish?: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  stylePreset?: string;
  lightIntensity?: number;
  lightColor?: string;
  description?: string;
  isCustom?: boolean;
  placementType?: 'floor' | 'tabletop' | 'wall' | 'ceiling';
  placeOnTable?: boolean;
  allowedOnFloor?: boolean;
  elevation?: number;
  defaultElevation?: number;
}

export interface FloorTemplate {
  id: string;
  name: string;
  description: string;
  floors: number;
  area: string;
}

export interface CollisionReport {
  collidingItemIds: Set<string>;
  reasons: Map<string, string>;
  totalCollisions: number;
}
