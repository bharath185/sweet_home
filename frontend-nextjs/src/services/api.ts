import { CatalogItem, HomePlan, User, FloorTemplate } from '../types/plan';
import LZString from 'lz-string';

const API_BASE = typeof window !== 'undefined' ? (window.location.port === '3000' ? 'http://localhost:8090/api' : '/api') : 'http://localhost:8090/api';

// 1. Sarah Jenkins: Modern 2-Bedroom Suite (Distinct Ground Floor & 1st Floor)
export const sarahPlan: HomePlan = {
  id: 'plan-sarah-suite',
  name: "Sarah Jenkins' Modern Suite",
  version: '1.0',
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
    { level: 1, name: '1st Floor', elevation: 250, height: 250 },
  ],
  walls: [
    // Ground Floor Outer Perimeter
    { id: 'sw1', xStart: -350, yStart: -250, xEnd: 350, yEnd: -250, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw2', xStart: 350, yStart: -250, xEnd: 350, yEnd: 250, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw3', xStart: 350, yStart: 250, xEnd: -350, yEnd: 250, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw4', xStart: -350, yStart: 250, xEnd: -350, yEnd: -250, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw5', xStart: 50, yStart: -250, xEnd: 50, yEnd: 250, thickness: 12, height: 250, color: '#e2e8f0', floorLevel: 0 },

    // 1st Floor Perimeter (Completely separate layout for Floor 1)
    { id: 'sw10', xStart: -300, yStart: -200, xEnd: 300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw11', xStart: 300, yStart: -200, xEnd: 300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw12', xStart: 300, yStart: 200, xEnd: -300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw13', xStart: -300, yStart: 200, xEnd: -300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw14', xStart: 0, yStart: -200, xEnd: 0, yEnd: 200, thickness: 12, height: 250, color: '#cbd5e1', floorLevel: 1 },
  ],
  furniture: [
    // Ground Floor Items (Floor 0)
    { id: 'sf1', catalogId: 'sofa', name: 'Corner Lounge Sofa', category: 'Living', x: -180, y: -100, elevation: 0, angle: 0, width: 220, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'sf2', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: -180, y: 10, elevation: 0, angle: 0, width: 90, depth: 90, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'sf3', catalogId: 'tvUnit', name: 'Media Console', category: 'Living', x: -180, y: 220, elevation: 0, angle: Math.PI, width: 160, depth: 45, height: 50, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'sf4', catalogId: 'kitchenCabinet', name: 'Kitchen Island Cabinet', category: 'Kitchen', x: 200, y: -120, elevation: 0, angle: 0, width: 120, depth: 60, height: 85, model: '/models/kitchenCabinet.obj', icon: '/models/kitchenCabinet.png', floorLevel: 0 },
    { id: 'sf5', catalogId: 'cooker', name: 'Induction Cooktop', category: 'Kitchen', x: 200, y: -190, elevation: 0, angle: 0, width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png', floorLevel: 0 },
    { id: 'sf6', catalogId: 'toiletUnit', name: 'Guest Restroom Suite', category: 'Bathroom', x: 200, y: 180, elevation: 0, angle: Math.PI / 2, width: 45, depth: 70, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', floorLevel: 0 },
    { id: 'sf7', catalogId: 'door', name: 'Ground Main Entrance', category: 'Doors & Windows', x: -350, y: 0, elevation: 0, angle: Math.PI / 2, width: 85, depth: 10, height: 205, model: '/models/door.obj', icon: '/models/door.png', floorLevel: 0 },

    // 1st Floor Items (Floor 1 - Fully separated, non-overlapping)
    { id: 'sf8', catalogId: 'bed140x190', name: 'Penthouse Queen Bed', category: 'Bedroom', x: -140, y: 0, elevation: 0, angle: Math.PI / 2, width: 150, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#f1f5f9', floorLevel: 1 },
    { id: 'sf9', catalogId: 'wardrobe', name: 'Master Wardrobe Closet', category: 'Bedroom', x: -260, y: -120, elevation: 0, angle: 0, width: 120, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 1 },
    { id: 'sf10', catalogId: 'bath', name: 'En-suite Luxury Bath', category: 'Bathroom', x: 180, y: -80, elevation: 0, angle: 0, width: 170, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf11', catalogId: 'armchair', name: 'Terrace Lounge Chair', category: 'Living', x: 160, y: 110, elevation: 0, angle: -Math.PI / 4, width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 1 },
  ],
  rooms: [
    {
      id: 'sr1',
      name: 'Open Living & Kitchen',
      floorLevel: 0,
      points: [{ x: -350, y: -250 }, { x: 350, y: -250 }, { x: 350, y: 250 }, { x: -350, y: 250 }],
      floorColor: '#e2e8f0',
      areaSquareMeters: 35.0,
    },
    {
      id: 'sr2',
      name: 'Master Suite & Terrace',
      floorLevel: 1,
      points: [{ x: -300, y: -200 }, { x: 300, y: -200 }, { x: 300, y: 200 }, { x: -300, y: 200 }],
      floorColor: '#cbd5e1',
      areaSquareMeters: 24.0,
    },
  ],
  dimensionLines: [],
  textNotes: [],
  preferences: { unitSystem: 'cm', defaultWallThickness: 15, defaultWallHeight: 250, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// 2. David Miller: Luxury Multi-Story Villa
export const davidPlan: HomePlan = {
  id: 'plan-david-villa',
  name: "David Miller's Luxury Villa",
  version: '1.0',
  createdAt: '2026-09-02T14:00:00Z',
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 280 },
    { level: 1, name: '1st Floor', elevation: 280, height: 280 },
  ],
  walls: [
    // Ground Floor
    { id: 'dw1', xStart: -400, yStart: -300, xEnd: 400, yEnd: -300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dw2', xStart: 400, yStart: -300, xEnd: 400, yEnd: 300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dw3', xStart: 400, yStart: 300, xEnd: -400, yEnd: 300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dw4', xStart: -400, yStart: 300, xEnd: -400, yEnd: -300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },

    // 1st Floor
    { id: 'dw10', xStart: -380, yStart: -280, xEnd: 380, yEnd: -280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dw11', xStart: 380, yStart: -280, xEnd: 380, yEnd: 280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dw12', xStart: 380, yStart: 280, xEnd: -380, yEnd: 280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dw13', xStart: -380, yStart: 280, xEnd: -380, yEnd: -280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
  ],
  furniture: [
    // Ground Floor: Grand Piano, Dining Table, Plants
    { id: 'df1', catalogId: 'piano', name: 'Concert Grand Piano', category: 'Living', x: -220, y: -120, elevation: 0, angle: Math.PI / 4, width: 150, depth: 160, height: 100, model: '/models/piano.obj', icon: '/models/piano.png', color: '#1e293b', floorLevel: 0 },
    { id: 'df2', catalogId: 'squareTable', name: 'Formal Dining Table', category: 'Living', x: 150, y: -100, elevation: 0, angle: 0, width: 180, depth: 100, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'df3', catalogId: 'chair', name: 'Dining Chair Left', category: 'Living', x: 80, y: -100, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'df4', catalogId: 'chair', name: 'Dining Chair Right', category: 'Living', x: 220, y: -100, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'df5', catalogId: 'plant', name: 'Grand Foyer Palm', category: 'Living', x: -320, y: 220, elevation: 0, angle: 0, width: 60, depth: 60, height: 140, model: '/models/plant.obj', icon: '/models/plant.png', floorLevel: 0 },

    // 1st Floor: Luxury Suites
    { id: 'df6', catalogId: 'bed140x190', name: 'Presidential Suite Bed', category: 'Bedroom', x: -160, y: -80, elevation: 0, angle: Math.PI / 2, width: 180, depth: 200, height: 100, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#d97706', floorLevel: 1 },
    { id: 'df7', catalogId: 'bath', name: 'Spa Jacuzzi Tub', category: 'Bathroom', x: 180, y: 80, elevation: 0, angle: 0, width: 180, depth: 90, height: 60, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 1 },
    { id: 'df8', catalogId: 'armchair', name: 'Velvet Recliner', category: 'Living', x: 180, y: -100, elevation: 0, angle: -Math.PI / 3, width: 90, depth: 90, height: 85, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 1 },
  ],
  rooms: [
    { id: 'dr1', name: 'Grand Foyer & Reception', floorLevel: 0, points: [{ x: -400, y: -300 }, { x: 400, y: -300 }, { x: 400, y: 300 }, { x: -400, y: 300 }], floorColor: '#f1f5f9', areaSquareMeters: 48.0 },
    { id: 'dr2', name: 'Presidential Penthouse Suite', floorLevel: 1, points: [{ x: -380, y: -280 }, { x: 380, y: -280 }, { x: 380, y: 280 }, { x: -380, y: 280 }], floorColor: '#e2e8f0', areaSquareMeters: 42.0 },
  ],
  dimensionLines: [],
  textNotes: [],
  preferences: { unitSystem: 'cm', defaultWallThickness: 20, defaultWallHeight: 280, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// 3. Emma Watson: Urban Studio Loft (Single-Story Minimalist)
export const emmaPlan: HomePlan = {
  id: 'plan-emma-studio',
  name: "Emma Watson's Urban Studio Loft",
  version: '1.0',
  createdAt: '2026-09-03T09:00:00Z',
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor Studio', elevation: 0, height: 260 },
  ],
  walls: [
    { id: 'ew1', xStart: -250, yStart: -200, xEnd: 250, yEnd: -200, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew2', xStart: 250, yStart: -200, xEnd: 250, yEnd: 200, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew3', xStart: 250, yStart: 200, xEnd: -250, yEnd: 200, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew4', xStart: -250, yStart: 200, xEnd: -250, yEnd: -200, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
  ],
  furniture: [
    { id: 'ef1', catalogId: 'sofa', name: 'Compact 2-Seater Sofa', category: 'Living', x: -120, y: -80, elevation: 0, angle: 0, width: 160, depth: 80, height: 80, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#84a98c', floorLevel: 0 },
    { id: 'ef2', catalogId: 'bookcase', name: 'Industrial Bookcase', category: 'Living', x: -210, y: 60, elevation: 0, angle: Math.PI / 2, width: 90, depth: 35, height: 180, model: '/models/bookcase.obj', icon: '/models/bookcase.png', color: '#27272a', floorLevel: 0 },
    { id: 'ef3', catalogId: 'bed90x190', name: 'Studio Daybed', category: 'Bedroom', x: 140, y: -80, elevation: 0, angle: Math.PI / 2, width: 100, depth: 200, height: 80, model: '/models/bed90x190.obj', icon: '/models/bed90x190.png', color: '#f5f5f4', floorLevel: 0 },
  ],
  rooms: [
    { id: 'er1', name: 'Open Urban Studio', floorLevel: 0, points: [{ x: -250, y: -200 }, { x: 250, y: -200 }, { x: 250, y: 200 }, { x: -250, y: 200 }], floorColor: '#e0d8c3', areaSquareMeters: 20.0 },
  ],
  dimensionLines: [],
  textNotes: [],
  preferences: { unitSystem: 'cm', defaultWallThickness: 15, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

export const sampleDefaultPlan: HomePlan = sarahPlan;

export const ALL_CLIENT_PLANS: Record<string, HomePlan> = {
  'plan-sarah-suite': sarahPlan,
  'plan-david-villa': davidPlan,
  'plan-emma-studio': emmaPlan,
};

export const fallbackCatalog: CatalogItem[] = [
  // --- LIVING ROOM ---
  { id: 'sofa', name: 'Corner Lounge Sofa', category: 'Living', width: 220, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', defaultColor: '#0284c7' },
  { id: 'armchair', name: 'Armchair', category: 'Living', width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', defaultColor: '#065f46' },
  { id: 'roundTable', name: 'Coffee Table', category: 'Living', width: 90, depth: 90, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', defaultColor: '#78350f' },
  { id: 'squareTable', name: 'Dining Table', category: 'Living', width: 150, depth: 90, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', defaultColor: '#5c4033' },
  { id: 'chair', name: 'Dining Chair', category: 'Living', width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', defaultColor: '#c2410c' },
  { id: 'stool', name: 'Bar Stool', category: 'Living', width: 40, depth: 40, height: 75, model: '/models/stool.obj', icon: '/models/stool.png' },
  { id: 'bookcase', name: 'Bookcase Shelf', category: 'Living', width: 90, depth: 35, height: 180, model: '/models/bookcase.obj', icon: '/models/bookcase.png' },
  { id: 'tvUnit', name: 'TV Media Console', category: 'Living', width: 180, depth: 45, height: 50, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', defaultColor: '#1e293b' },
  { id: 'piano', name: 'Grand Piano', category: 'Living', width: 150, depth: 160, height: 100, model: '/models/piano.obj', icon: '/models/piano.png', defaultColor: '#09090b' },

  // --- BEDROOM ---
  { id: 'bed140x190', name: 'Double Bed (140x190)', category: 'Bedroom', width: 150, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', defaultColor: '#f1f5f9' },
  { id: 'bed90x190', name: 'Single Bed (90x190)', category: 'Bedroom', width: 100, depth: 200, height: 85, model: '/models/bed90x190.obj', icon: '/models/bed90x190.png' },
  { id: 'bunkBed90x190', name: 'Bunk Bed', category: 'Bedroom', width: 100, depth: 200, height: 165, model: '/models/bunkBed90x190.obj', icon: '/models/bunkBed90x190.png' },
  { id: 'wardrobe', name: '2-Door Wardrobe Closet', category: 'Bedroom', width: 120, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', defaultColor: '#475569' },
  { id: 'bedsideTable', name: 'Nightstand Bedside Table', category: 'Bedroom', width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png' },

  // --- KITCHEN & BATHROOM ---
  { id: 'kitchenCabinet', name: 'Kitchen Counter Cabinet', category: 'Kitchen', width: 120, depth: 60, height: 85, model: '/models/kitchenCabinet.obj', icon: '/models/kitchenCabinet.png' },
  { id: 'cooker', name: 'Induction Cooktop Stove', category: 'Kitchen', width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png' },
  { id: 'bath', name: 'Luxury Bathtub', category: 'Bathroom', width: 170, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', defaultColor: '#ffffff' },
  { id: 'toiletUnit', name: 'Modern Toilet Suite', category: 'Bathroom', width: 45, depth: 70, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png' },

  // --- DOORS DESIGNS ---
  {
    id: 'doorBarnSliding',
    name: 'Sliding Rustic Barn Door',
    category: 'Doors & Windows',
    width: 95,
    depth: 10,
    height: 215,
    model: 'procedural:door:{"type":"barn_sliding"}',
    icon: '/models/door.png',
    defaultColor: '#78350f',
    description: 'Rustic wooden barn door with top steel rail track and exposed rollers'
  },
  {
    id: 'doorModernFlush',
    name: 'Modern Timber Flush Door',
    category: 'Doors & Windows',
    width: 85,
    depth: 10,
    height: 205,
    model: 'procedural:door:{"type":"modern_flush"}',
    icon: '/models/door.png',
    defaultColor: '#f1f5f9',
    description: 'Minimalist interior flush door with stainless steel lever handle and satin trim frame'
  },
  {
    id: 'doorGlassFrench',
    name: 'Double Glass French Doors',
    category: 'Doors & Windows',
    width: 150,
    depth: 10,
    height: 210,
    model: 'procedural:door:{"type":"glass_french"}',
    icon: '/models/door.png',
    defaultColor: '#1e293b',
    description: 'Double leaf French doors with tempered glass insets, wood mullions, and brass handles'
  },
  {
    id: 'doorArchedWood',
    name: 'Mediterranean Arched Door',
    category: 'Doors & Windows',
    width: 90,
    depth: 10,
    height: 215,
    model: 'procedural:door:{"type":"arched_wood"}',
    icon: '/models/door.png',
    defaultColor: '#92400e',
    description: 'Classic Mediterranean arched solid timber door with antique brass knob'
  },

  // --- WINDOWS DESIGNS ---
  {
    id: 'windowModernSliding',
    name: 'Modern Sliding Glass Window',
    category: 'Doors & Windows',
    width: 120,
    depth: 15,
    height: 120,
    elevation: 90,
    defaultElevation: 90,
    placementType: 'wall',
    model: 'procedural:window:{"type":"modern_sliding"}',
    icon: '/models/window85x123.png',
    defaultColor: '#334155',
    description: 'Dual-pane sliding window with sleek aluminum frame and 90cm wall sill'
  },
  {
    id: 'windowFrenchArch',
    name: 'French Sunburst Arch Window',
    category: 'Doors & Windows',
    width: 100,
    depth: 15,
    height: 150,
    elevation: 70,
    defaultElevation: 70,
    placementType: 'wall',
    model: 'procedural:window:{"type":"french_arch"}',
    icon: '/models/window85x123.png',
    defaultColor: '#ffffff',
    description: 'Graceful architectural arched top window with radial mullions'
  },
  {
    id: 'windowPanoramic',
    name: 'Panoramic Floor-to-Ceiling Window',
    category: 'Doors & Windows',
    width: 200,
    depth: 12,
    height: 220,
    model: 'procedural:window:{"type":"picture_panoramic"}',
    icon: '/models/window85x123.png',
    defaultColor: '#0f172a',
    description: 'Large picture window offering unobstructed garden and skyline vistas'
  },
  {
    id: 'windowGridDoubleHung',
    name: 'Classic 6-Pane Double Hung Window',
    category: 'Doors & Windows',
    width: 90,
    depth: 15,
    height: 140,
    elevation: 80,
    defaultElevation: 80,
    placementType: 'wall',
    model: 'procedural:window:{"type":"grid_double_hung"}',
    icon: '/models/window85x123.png',
    defaultColor: '#f8fafc',
    description: 'Colonial style 6-over-6 pane double-hung window with deep sill'
  },

  // --- WALL DESIGNS & ACCENT PANELS ---
  {
    id: 'wallWoodSlat',
    name: 'Vertical Acoustic Wood Slat Wall',
    category: 'Wall Designs',
    width: 180,
    depth: 4,
    height: 250,
    model: 'procedural:wallDesign:{"type":"wood_slat"}',
    icon: '/models/bookcase.png',
    defaultColor: '#b45309',
    description: 'Modern Scandinavian vertical oak wood slat acoustic feature wall panel'
  },
  {
    id: 'wallMarbleSlab',
    name: 'Luxury Marble Slab with Brass Inlays',
    category: 'Wall Designs',
    width: 200,
    depth: 4,
    height: 250,
    model: 'procedural:wallDesign:{"type":"marble_slab"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#f8fafc',
    description: 'Large format luxury Calacatta marble slab wall panel with vertical gold brass strips'
  },
  {
    id: 'wallWainscoting',
    name: 'Classic Wainscoting & Moldings',
    category: 'Wall Designs',
    width: 200,
    depth: 4,
    height: 110,
    model: 'procedural:wallDesign:{"type":"wainscoting"}',
    icon: '/models/bookcase.png',
    defaultColor: '#ffffff',
    description: 'Traditional recessed wainscoting panel with chair rail and picture frame molding'
  },
  {
    id: 'wallBrickCladding',
    name: 'Exposed Industrial Brick Wall',
    category: 'Wall Designs',
    width: 200,
    depth: 5,
    height: 250,
    model: 'procedural:wallDesign:{"type":"brick_cladding"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#991b1b',
    description: 'Rustic urban loft red brick cladding texture with natural mortar relief'
  },

  // --- SHELVES & WALL STORAGE ---
  {
    id: 'shelfFloatingOak',
    name: 'Floating Oak Wall Shelf',
    category: 'Shelves & Storage',
    width: 120,
    depth: 25,
    height: 5,
    elevation: 140,
    placementType: 'wall',
    model: 'procedural:shelf:{"type":"floating","plankThickness":4}',
    icon: '/models/bookcase.png',
    defaultColor: '#d97706',
    description: 'Minimalist floating solid oak wall shelf with concealed mounting'
  },
  {
    id: 'shelfHexagon',
    name: 'Honeycomb Hexagon Wall Shelves',
    category: 'Shelves & Storage',
    width: 80,
    depth: 20,
    height: 70,
    elevation: 120,
    placementType: 'wall',
    model: 'procedural:shelf:{"type":"hexagon"}',
    icon: '/models/bookcase.png',
    defaultColor: '#78350f',
    description: 'Geometric honeycomb hexagonal display shelf with center partition'
  },
  {
    id: 'shelfModularCubes',
    name: 'Staggered 3-Tier Wall Cubbies',
    category: 'Shelves & Storage',
    width: 110,
    depth: 22,
    height: 90,
    elevation: 110,
    placementType: 'wall',
    model: 'procedural:shelf:{"type":"modular_cubes"}',
    icon: '/models/bookcase.png',
    defaultColor: '#334155',
    description: 'Asymmetrical modular wall display boxes for books, plants, and art'
  },
  {
    id: 'shelfIndustrialPipe',
    name: 'Industrial Iron Pipe 2-Tier Shelf',
    category: 'Shelves & Storage',
    width: 130,
    depth: 25,
    height: 75,
    elevation: 120,
    placementType: 'wall',
    model: 'procedural:shelf:{"type":"industrial_pipe"}',
    icon: '/models/bookcase.png',
    defaultColor: '#92400e',
    description: 'Rustic timber shelves supported by matte black iron plumbing pipe flanges'
  },

  // --- INTERIOR DECOR, RUGS & MIRRORS ---
  {
    id: 'decorWallArt',
    name: 'Framed Gallery Canvas Painting',
    category: 'Decor & Plants',
    width: 120,
    depth: 5,
    height: 80,
    elevation: 130,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"wall_art"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#38bdf8',
    description: 'Contemporary abstract framed canvas wall art for living and dining spaces'
  },
  {
    id: 'decorArchedMirror',
    name: 'Arched Floor-Standing Brass Mirror',
    category: 'Decor & Plants',
    width: 75,
    depth: 10,
    height: 180,
    model: 'procedural:decor:{"type":"arched_mirror"}',
    icon: '/models/wardrobe.png',
    defaultColor: '#eab308',
    description: 'Full-length arched standing mirror with elegant slender gold brass rim'
  },
  {
    id: 'decorVanityMirror',
    name: 'Round Backlit LED Vanity Mirror',
    category: 'Decor & Plants',
    width: 80,
    depth: 6,
    height: 80,
    elevation: 120,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"vanity_mirror"}',
    icon: '/models/pendantLamp.png',
    defaultColor: '#ffffff',
    description: 'Circular bathroom & bedroom vanity mirror with ambient warm LED halo illumination'
  },
  {
    id: 'decorCurtains',
    name: 'Pleated Window Drapes & Curtain Rod',
    category: 'Decor & Plants',
    width: 180,
    depth: 15,
    height: 230,
    elevation: 10,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"curtains"}',
    icon: '/models/wardrobe.png',
    defaultColor: '#f1f5f9',
    description: 'Flowing floor-length pleated fabric drapery with black curtain rod and rings'
  },
  {
    id: 'decorAreaRug',
    name: 'Plush Geometric Area Rug (200x290)',
    category: 'Decor & Plants',
    width: 290,
    depth: 200,
    height: 2,
    model: 'procedural:decor:{"type":"area_rug"}',
    icon: '/models/roundTable.png',
    defaultColor: '#e2e8f0',
    description: 'Soft woven modern area rug to anchor living room and bedroom seating'
  },
  {
    id: 'decorPottedPlant',
    name: 'Indoor Monstera Plant on Wooden Stand',
    category: 'Decor & Plants',
    width: 60,
    depth: 60,
    height: 120,
    model: 'procedural:decor:{"type":"potted_plant"}',
    icon: '/models/plant.png',
    defaultColor: '#16a34a',
    description: 'Lush potted tropical plant in cylindrical ceramic pot with solid teak tripod stand'
  },
  {
    id: 'tableVase',
    name: 'Ceramic Tabletop Vase',
    category: 'Decor & Plants',
    width: 25,
    depth: 25,
    height: 35,
    model: 'procedural:lamp:{"type":"globe_orb","shadeWidth":22,"shadeHeight":22,"totalHeight":35}',
    icon: '/models/plant.png',
    placementType: 'tabletop',
    placeOnTable: true,
    defaultColor: '#f8fafc'
  },

  // --- LIGHTING ---
  { id: 'pendantLamp', name: 'Ceiling Pendant Lamp', category: 'Lighting', width: 40, depth: 40, height: 60, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":40,"shadeHeight":25,"totalHeight":60}', icon: '/models/pendantLamp.png', placementType: 'ceiling', lightIntensity: 1.4, defaultColor: '#38bdf8' },
  { id: 'ceilingFan', name: 'Ceiling Fan with Integrated Light', category: 'Lighting', width: 120, depth: 120, height: 40, model: 'procedural:lamp:{"type":"ceiling_fan","shadeWidth":120,"shadeHeight":30,"totalHeight":40}', icon: '/models/pendantLamp.png', placementType: 'ceiling', lightIntensity: 1.1, defaultColor: '#334155' },
  { id: 'chandelier', name: 'Luxury Crystal Chandelier', category: 'Lighting', width: 80, depth: 80, height: 75, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":75,"shadeHeight":60,"totalHeight":75}', icon: '/models/pendantLamp.png', placementType: 'ceiling', lightIntensity: 1.8, defaultColor: '#eab308' },
  { id: 'recessedSpot', name: 'Recessed Ceiling LED Downlight', category: 'Lighting', width: 25, depth: 25, height: 8, model: 'procedural:lamp:{"type":"recessed_spot","shadeWidth":22,"shadeHeight":6,"totalHeight":8}', icon: '/models/pendantLamp.png', placementType: 'ceiling', lightIntensity: 1.5, defaultColor: '#ffffff' },
  { id: 'ceilingFlush', name: 'Modern Flush Ceiling Light Panel', category: 'Lighting', width: 60, depth: 60, height: 10, model: 'procedural:lamp:{"type":"flush_panel","shadeWidth":56,"shadeHeight":8,"totalHeight":10}', icon: '/models/pendantLamp.png', placementType: 'ceiling', lightIntensity: 1.4, defaultColor: '#f8fafc' },
  { id: 'tableLamp', name: 'Tabletop Desk Lamp', category: 'Lighting', width: 30, depth: 30, height: 45, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":25,"shadeHeight":20,"totalHeight":45}', icon: '/models/pendantLamp.png', placementType: 'tabletop', placeOnTable: true, defaultColor: '#fef08a' },

  // --- STRUCTURAL & DINING ---
  { id: 'dinnerSet', name: 'Fine Dining Table Setting', category: 'Living', width: 60, depth: 40, height: 12, model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":2,"legThickness":2,"bevel":true}', icon: '/models/squareTable.png', placementType: 'tabletop', placeOnTable: true, defaultColor: '#ffffff' },
  { id: 'staircase', name: 'Straight Staircase', category: 'Stairs & Structural', width: 90, depth: 260, height: 250, model: '/models/staircase.obj', icon: '/models/staircase.png' },
];

export async function fetchCatalog(): Promise<CatalogItem[]> {
  let customItems: CatalogItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('sweethome_custom_catalog');
      if (cached) {
        customItems = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/catalog/furniture`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Merge custom items at the top
        const existingIds = new Set(data.map((i: CatalogItem) => i.id));
        const uniqueCustom = customItems.filter((i) => !existingIds.has(i.id));
        return [...uniqueCustom, ...data];
      }
    }
  } catch (err) {
    console.warn('Backend catalog API offline, using local catalog.', err);
  }

  const existingIds = new Set(fallbackCatalog.map((i) => i.id));
  const uniqueCustom = customItems.filter((i) => !existingIds.has(i.id));
  return [...uniqueCustom, ...fallbackCatalog];
}

export async function addCustomCatalogItem(item: CatalogItem): Promise<CatalogItem> {
  const customItem = { ...item, isCustom: true };
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('sweethome_custom_catalog');
      const list: CatalogItem[] = cached ? JSON.parse(cached) : [];
      const updated = [customItem, ...list.filter((i) => i.id !== customItem.id)];
      localStorage.setItem('sweethome_custom_catalog', JSON.stringify(updated));
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/catalog/furniture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customItem),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not save item to backend, saved locally.', err);
  }
  return customItem;
}

export async function deleteCatalogItem(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('sweethome_custom_catalog');
      if (cached) {
        const list: CatalogItem[] = JSON.parse(cached);
        const updated = list.filter((i) => i.id !== id);
        localStorage.setItem('sweethome_custom_catalog', JSON.stringify(updated));
      }
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/catalog/furniture/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend users API offline, using mock users.', err);
  }
  return [
    { id: 'u1', name: 'Admin Superuser', email: 'admin@sweethome3d.io', role: 'ADMIN', isOnline: true, assignedPlan: 'plan-sarah-suite', createdAt: 'Today' },
    { id: 'u2', name: 'Interior Architect', email: 'designer@sweethome3d.io', role: 'DESIGNER', isOnline: true, assignedPlan: 'plan-david-villa', createdAt: 'Today' },
    { id: 'u3', name: 'Sarah Jenkins (Client)', email: 'client.sarah@gmail.com', role: 'CLIENT', isOnline: true, assignedPlan: 'plan-sarah-suite', createdAt: 'Today' },
    { id: 'u4', name: 'David Miller (Client)', email: 'david.m@yahoo.com', role: 'CLIENT', isOnline: false, assignedPlan: 'plan-david-villa', createdAt: 'Yesterday' },
    { id: 'u5', name: 'Emma Watson (Client)', email: 'emma.w@design.io', role: 'CLIENT', isOnline: true, assignedPlan: 'plan-emma-studio', createdAt: 'Today' },
  ];
}

export function createFreshPlanForClient(
  clientName: string,
  templateType?: string,
  customName?: string
): HomePlan {
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const cleanId = `plan-${slug}-${Date.now().toString().slice(-4)}`;
  const planName = customName || `${clientName}'s Design Project`;

  if (templateType === 'plan-david-villa') {
    const copy: HomePlan = JSON.parse(JSON.stringify(davidPlan));
    copy.id = cleanId;
    copy.name = planName;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    ALL_CLIENT_PLANS[cleanId] = copy;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${cleanId}`, JSON.stringify(copy));
    }
    return copy;
  }

  if (templateType === 'plan-emma-studio') {
    const copy: HomePlan = JSON.parse(JSON.stringify(emmaPlan));
    copy.id = cleanId;
    copy.name = planName;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    ALL_CLIENT_PLANS[cleanId] = copy;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${cleanId}`, JSON.stringify(copy));
    }
    return copy;
  }

  if (templateType === 'plan-sarah-suite') {
    const copy: HomePlan = JSON.parse(JSON.stringify(sarahPlan));
    copy.id = cleanId;
    copy.name = planName;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    ALL_CLIENT_PLANS[cleanId] = copy;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sweethome_plan_${cleanId}`, JSON.stringify(copy));
    }
    return copy;
  }

  // DEFAULT: Fresh clean blank design (Clean perimeter walls + room floor, 0 pre-placed furniture)
  const freshPlan: HomePlan = {
    id: cleanId,
    name: planName,
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentFloor: 0,
    floors: [
      { level: 0, name: 'Ground Floor', elevation: 0, height: 250 },
    ],
    walls: [
      { id: `w_${cleanId}_1`, xStart: -300, yStart: -200, xEnd: 300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
      { id: `w_${cleanId}_2`, xStart: 300, yStart: -200, xEnd: 300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
      { id: `w_${cleanId}_3`, xStart: 300, yStart: 200, xEnd: -300, yEnd: 200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
      { id: `w_${cleanId}_4`, xStart: -300, yStart: 200, xEnd: -300, yEnd: -200, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 0 },
    ],
    furniture: [],
    rooms: [
      {
        id: `r_${cleanId}_1`,
        name: 'Main Space',
        floorLevel: 0,
        points: [
          { x: -300, y: -200 },
          { x: 300, y: -200 },
          { x: 300, y: 200 },
          { x: -300, y: 200 },
        ],
        floorColor: '#f1f5f9',
        areaSquareMeters: 24.0,
      }
    ],
    dimensionLines: [],
    textNotes: [],
    preferences: {
      unitSystem: 'cm',
      defaultWallThickness: 15,
      defaultWallHeight: 250,
      gridSize: 20,
      magnetismEnabled: true,
      showRulers: true,
    },
  };

  ALL_CLIENT_PLANS[cleanId] = freshPlan;
  if (typeof window !== 'undefined') {
    localStorage.setItem(`sweethome_plan_${cleanId}`, JSON.stringify(freshPlan));
  }
  return freshPlan;
}

export async function createAdminUser(
  userData: Partial<User>,
  templateType?: string
): Promise<{ user: User; plan: HomePlan }> {
  const clientName = userData.name || 'New Client';
  const freshPlan = createFreshPlanForClient(clientName, templateType, userData.assignedPlan);

  const newUser: User = {
    id: `u_${Date.now()}`,
    name: clientName,
    email: userData.email || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    role: userData.role || 'CLIENT',
    isOnline: true,
    assignedPlan: freshPlan.id,
    createdAt: new Date().toLocaleTimeString(),
  };

  try {
    const res = await fetch(`${API_BASE}/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const serverUser = await res.json();
      return { user: { ...newUser, ...serverUser }, plan: freshPlan };
    }
  } catch (err) {
    console.warn('Failed to create user on backend, returning local.', err);
  }

  // Also save the fresh plan to backend
  savePlanToBackend(freshPlan);

  return { user: newUser, plan: freshPlan };
}

export async function toggleUserStatus(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/toggle-status`, { method: 'POST' });
    return res.ok;
  } catch {
    return true;
  }
}

export async function fetchFloorTemplates(): Promise<FloorTemplate[]> {
  try {
    const res = await fetch(`${API_BASE}/plan/templates`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Templates API offline, using defaults.', err);
  }
  return [
    { id: 'plan-sarah-suite', name: 'Modern 2-Bedroom Suite', description: 'Spacious open living room with master suite.', floors: 2, area: '59 m²' },
    { id: 'plan-david-villa', name: 'Luxury Multi-Story Villa', description: 'Grand foyer with private suites and jacuzzi.', floors: 2, area: '90 m²' },
    { id: 'plan-emma-studio', name: 'Urban Studio Loft', description: 'Minimalist open-plan studio layout.', floors: 1, area: '20 m²' },
  ];
}

export async function fetchPlanById(planId: string): Promise<HomePlan> {
  // 1. Check local storage cache
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`sweethome_plan_${planId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }

  // 2. Check Backend
  try {
    const res = await fetch(`${API_BASE}/plan/${planId}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}

  // 3. Check Built-in Client Plans
  if (ALL_CLIENT_PLANS[planId]) {
    return ALL_CLIENT_PLANS[planId];
  }

  // 4. Default
  return sarahPlan;
}

export async function savePlanToBackend(
  plan: HomePlan,
  authorName: string = 'User',
  changeDesc: string = 'Auto-saved plan state'
): Promise<{ success: boolean; id: string; version?: number; message?: string }> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`sweethome_plan_${plan.id}`, JSON.stringify(plan));
  }
  try {
    const url = new URL(`${API_BASE}/plan/save`);
    url.searchParams.set('author', authorName);
    url.searchParams.set('description', changeDesc);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        id: data.planId || plan.id,
        version: data.version,
        message: `Saved "${plan.name}" to PostgreSQL database!`
      };
    }
  } catch (err) {
    console.warn('PostgreSQL save failed, saved locally.', err);
  }
  return { success: true, id: plan.id, message: `Saved "${plan.name}" in local storage cache.` };
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export function encodePlanToShareUrl(plan: HomePlan, role: string = 'CLIENT'): string {
  const jsonStr = JSON.stringify(plan);
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/?mode=customer&role=${role}&planId=${plan.id}&data=${compressed}`;
  }
  return `?mode=customer&role=${role}&planId=${plan.id}&data=${compressed}`;
}

export function decodePlanFromShareUrl(encoded: string): HomePlan | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as HomePlan;
  } catch (e) {
    console.error('Failed to decode plan from share URL:', e);
    return null;
  }
}

