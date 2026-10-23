import { CatalogItem, HomePlan, User, FloorTemplate } from '../types/plan';
import { referenceLuxuryPlan } from './referencePlans';
import LZString from 'lz-string';

const API_BASE = '/api';

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
    // --- GROUND FLOOR (Matching DecoFrog 3D Reference Exactly - Spacious Proportions) ---
    // 1. Living & Dining Room Walls (Olive Green #849b3c)
    { id: 'sw_liv_top', xStart: -550, yStart: -380, xEnd: -110, yEnd: -380, thickness: 15, height: 250, color: '#849b3c', floorLevel: 0 },
    { id: 'sw_liv_left', xStart: -550, yStart: 380, xEnd: -550, yEnd: -380, thickness: 15, height: 250, color: '#849b3c', floorLevel: 0 },
    { id: 'sw_liv_btm', xStart: -110, yStart: 380, xEnd: -550, yEnd: 380, thickness: 15, height: 250, color: '#849b3c', floorLevel: 0 },
    { id: 'sw_liv_div', xStart: -110, yStart: -380, xEnd: -110, yEnd: 380, thickness: 12, height: 250, color: '#849b3c', floorLevel: 0 },

    // 2. Central Corridor Walls (Slate Blue #5b7a9c)
    { id: 'sw_corr_top', xStart: -110, yStart: -380, xEnd: 50, yEnd: -380, thickness: 15, height: 250, color: '#5b7a9c', floorLevel: 0 },
    { id: 'sw_corr_btm', xStart: 50, yStart: 380, xEnd: -110, yEnd: 380, thickness: 15, height: 250, color: '#5b7a9c', floorLevel: 0 },
    { id: 'sw_corr_div', xStart: 50, yStart: -380, xEnd: 50, yEnd: 380, thickness: 12, height: 250, color: '#5b7a9c', floorLevel: 0 },

    // 3. Kitchen & Dining Walls (Warm Ochre #cc8519)
    { id: 'sw_kitch_top', xStart: 50, yStart: -380, xEnd: 550, yEnd: -380, thickness: 15, height: 250, color: '#cc8519', floorLevel: 0 },
    { id: 'sw_kitch_east', xStart: 550, yStart: -380, xEnd: 550, yEnd: -80, thickness: 15, height: 250, color: '#cc8519', floorLevel: 0 },
    { id: 'sw_kitch_div', xStart: 50, yStart: -80, xEnd: 550, yEnd: -80, thickness: 12, height: 250, color: '#cc8519', floorLevel: 0 },

    // 4. Utility / Taupe Room Walls (Warm Taupe #a89a8c)
    { id: 'sw_taupe_east', xStart: 550, yStart: -80, xEnd: 550, yEnd: 60, thickness: 15, height: 250, color: '#a89a8c', floorLevel: 0 },
    { id: 'sw_taupe_div', xStart: 50, yStart: 60, xEnd: 550, yEnd: 60, thickness: 12, height: 250, color: '#a89a8c', floorLevel: 0 },

    // 5. Pink Bedroom & Study Walls (Soft Pastel Pink #ec92a8)
    { id: 'sw_bed_east', xStart: 550, yStart: 60, xEnd: 550, yEnd: 380, thickness: 15, height: 250, color: '#ec92a8', floorLevel: 0 },
    { id: 'sw_bed_btm', xStart: 550, yStart: 380, xEnd: 50, yEnd: 380, thickness: 15, height: 250, color: '#ec92a8', floorLevel: 0 },

    // --- 1ST FLOOR PERIMETER & ROOM WALLS (Matching Ground Floor Footprint Exactly: 11m x 7.6m) ---
    { id: 'sw_up_top', xStart: -550, yStart: -380, xEnd: 550, yEnd: -380, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw_up_east', xStart: 550, yStart: -380, xEnd: 550, yEnd: 380, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw_up_btm', xStart: 550, yStart: 380, xEnd: -550, yEnd: 380, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw_up_west', xStart: -550, yStart: 380, xEnd: -550, yEnd: -380, thickness: 15, height: 250, color: '#f8fafc', floorLevel: 1 },
    { id: 'sw_up_div_west', xStart: -110, yStart: -380, xEnd: -110, yEnd: 380, thickness: 12, height: 250, color: '#f1f5f9', floorLevel: 1 },
    { id: 'sw_up_div_east', xStart: 50, yStart: -380, xEnd: 50, yEnd: 380, thickness: 12, height: 250, color: '#f1f5f9', floorLevel: 1 },
  ],
  furniture: [
    // --- 1. LIVING & DINING ROOM (Left Room: Olive Walls, Teal Carpet, ~33.4m²) ---
    // Oval Cherry Table with 4 Spindle Chairs
    { id: 'sf_dt', catalogId: 'roundTable', name: 'Oval Cherry Dining Table', category: 'Living', x: -330, y: -200, elevation: 0, angle: 0, width: 170, depth: 105, height: 75, model: 'procedural:table:{"shape":"oval","topThickness":4,"legThickness":5,"bevel":true}', icon: '/models/roundTable.png', color: '#b45309', floorLevel: 0 },
    { id: 'sf_ch1', catalogId: 'chair', name: 'Spindle Dining Chair N', category: 'Living', x: -330, y: -265, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"cushioned"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },
    { id: 'sf_ch2', catalogId: 'chair', name: 'Spindle Dining Chair S', category: 'Living', x: -330, y: -135, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"cushioned"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },
    { id: 'sf_ch3', catalogId: 'chair', name: 'Spindle Dining Chair W', category: 'Living', x: -428, y: -200, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"cushioned"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },
    { id: 'sf_ch4', catalogId: 'chair', name: 'Spindle Dining Chair E', category: 'Living', x: -232, y: -200, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"cushioned"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },

    // Angled Smart TV Console & Armchair in Lounge Zone
    { id: 'sf_tv', catalogId: 'tvUnit', name: 'Smart LED TV & Console', category: 'Living', x: -420, y: 240, elevation: 0, angle: Math.PI / 4, width: 150, depth: 45, height: 95, model: 'procedural:tvUnit:{}', icon: '/models/tvUnit.png', color: '#c26d24', floorLevel: 0 },
    { id: 'sf_armchair', catalogId: 'chair', name: 'Moss Green Lounge Armchair', category: 'Living', x: -240, y: 260, elevation: 0, angle: -Math.PI / 4, width: 95, depth: 90, height: 80, model: 'procedural:chair:{"backrestStyle":"wingback","seatType":"cushioned"}', icon: '/models/chair.png', color: '#4d7c0f', floorLevel: 0 },

    // Windows & Sliding Patio Door
    { id: 'sf_liv_win', catalogId: 'windowModernSliding', name: 'Casement Window', category: 'Doors & Windows', x: -330, y: -380, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'sf_patio_door', catalogId: 'doorModernFlush', name: 'Patio French Door', category: 'Doors & Windows', x: -550, y: 70, elevation: 0, angle: Math.PI / 2, width: 110, depth: 12, height: 215, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Outdoor Flight of Stairs & Deck (Left Exterior on Green Lawn)
    { id: 'sf_porch_deck', catalogId: 'squareTable', name: 'Outdoor Porch Deck', category: 'Stairs & Structural', x: -640, y: 70, elevation: 0, angle: 0, width: 150, depth: 220, height: 15, model: 'procedural:table:{"shape":"rectangular","topThickness":15,"legThickness":0}', icon: '/models/squareTable.png', color: '#334155', floorLevel: 0 },
    { id: 'sf_porch_stairs', catalogId: 'staircaseOutdoorDeck', name: 'Outdoor Porch & Timber Deck Flight', category: 'Stairs & Structural', x: -640, y: 280, elevation: 0, angle: 0, width: 110, depth: 200, height: 150, model: 'procedural:stairs:{"type":"outdoor_deck","stepsCount":8,"hasHandrail":true}', icon: '/models/staircase.png', color: '#92400e', floorLevel: 0 },

    // --- 2. CORRIDOR (Center Hallway: Slate Blue Walls, Teal Floor, ~12.2m²) ---
    { id: 'sf_front_door', catalogId: 'doorModernFlush', name: 'Entrance Front Door', category: 'Doors & Windows', x: -30, y: -380, elevation: 0, angle: 0, width: 90, depth: 12, height: 210, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#3b82f6', floorLevel: 0 },
    { id: 'sf_front_steps', catalogId: 'staircaseOutdoorConcrete', name: 'Exterior Solid Stone Entry Steps', category: 'Stairs & Structural', x: -30, y: -425, elevation: 0, angle: 0, width: 120, depth: 75, height: 35, model: 'procedural:stairs:{"type":"outdoor_concrete","stepsCount":3,"hasHandrail":true}', icon: '/models/staircase.png', color: '#cbd5e1', floorLevel: 0 },

    // Realistic Foyer & Hallway Furniture (Clear passage without blocking stairs)
    { id: 'sf_foyer_console', catalogId: 'squareTable', name: 'Fluted Foyer Console Table', category: 'Living', x: -95, y: -80, elevation: 0, angle: Math.PI / 2, width: 100, depth: 32, height: 80, model: 'procedural:table:{"shape":"rectangular","topThickness":4,"legThickness":3}', icon: '/models/squareTable.png', color: '#c29f79', floorLevel: 0 },
    { id: 'sf_foyer_plant', catalogId: 'plant', name: 'Potted Fiddle Leaf Fig', category: 'Decor & Plants', x: -85, y: 120, elevation: 0, angle: 0, width: 45, depth: 45, height: 110, model: '/models/plant.obj', icon: '/models/plant.png', color: '#166534', floorLevel: 0 },
    { id: 'sf_corr_door', catalogId: 'doorModernFlush', name: 'Bedroom Passage Door', category: 'Doors & Windows', x: 50, y: 220, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // --- 3. KITCHEN & DINING (Top-Right: Warm Ochre Walls, Golden Parquet, ~15.0m²) ---
    { id: 'sf_ktable', catalogId: 'squareTable', name: 'Kitchen Dining Table', category: 'Kitchen', x: 250, y: -230, elevation: 0, angle: 0, width: 140, depth: 85, height: 75, model: 'procedural:table:{"shape":"rectangular","topThickness":4,"legThickness":5}', icon: '/models/squareTable.png', color: '#b45309', floorLevel: 0 },
    { id: 'sf_kch1', catalogId: 'chair', name: 'Kitchen Chair West', category: 'Kitchen', x: 175, y: -230, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"wood_plank"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },
    { id: 'sf_kch2', catalogId: 'chair', name: 'Kitchen Chair East', category: 'Kitchen', x: 325, y: -230, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 90, model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"wood_plank"}', icon: '/models/chair.png', color: '#92400e', floorLevel: 0 },
    { id: 'sf_pendant', catalogId: 'pendantLamp', name: 'Golden Dome Pendant Lamp', category: 'Lighting', x: 250, y: -230, elevation: 200, angle: 0, width: 45, depth: 45, height: 55, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":45,"shadeHeight":28,"totalHeight":70}', icon: '/models/pendantLamp.png', color: '#eab308', floorLevel: 0, placementType: 'ceiling' },
    { id: 'sf_kcounter', catalogId: 'kitchenCabinet', name: 'White Kitchen Counter & Sink', category: 'Kitchen', x: 480, y: -220, elevation: 0, angle: -Math.PI / 2, width: 140, depth: 60, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#f8fafc', floorLevel: 0 },
    { id: 'sf_kcooker', catalogId: 'cooker', name: 'Induction Cooker Range', category: 'Kitchen', x: 480, y: -120, elevation: 0, angle: -Math.PI / 2, width: 60, depth: 60, height: 85, model: 'procedural:cooker:{}', icon: '/models/cooker.png', color: '#f1f5f9', floorLevel: 0 },
    { id: 'sf_kradiator', catalogId: 'radiator', name: 'Kitchen Wall Radiator', category: 'Bathroom', x: 370, y: -374, elevation: 15, angle: 0, width: 70, depth: 10, height: 60, model: 'procedural:radiator:{}', icon: '/models/tvUnit.png', color: '#ffffff', floorLevel: 0, placementType: 'wall' },
    { id: 'sf_pantry', catalogId: 'kitchenCabinet', name: 'Tall Kitchen Pantry Cabinet', category: 'Kitchen', x: 480, y: -320, elevation: 0, angle: -Math.PI / 2, width: 65, depth: 55, height: 200, model: 'procedural:cabinet:{"columns":1,"rows":3,"doorType":"solid_doors","hasLegs":true}', icon: '/models/kitchenCabinet.png', color: '#78350f', floorLevel: 0 },
    { id: 'sf_kwin', catalogId: 'windowModernSliding', name: 'Kitchen Casement Window', category: 'Doors & Windows', x: 250, y: -380, elevation: 90, angle: 0, width: 120, depth: 15, height: 115, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // --- 4. PINK BEDROOM & STUDY (Bottom-Right: Pink Walls, Lavender Floor, ~16.0m²) ---
    { id: 'sf_wardrobe1', catalogId: 'kitchenCabinet', name: 'Periwinkle Double Wardrobe', category: 'Bedroom', x: 180, y: 125, elevation: 0, angle: 0, width: 110, depth: 60, height: 195, model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#b4c6e7', floorLevel: 0 },
    { id: 'sf_wardrobe2', catalogId: 'kitchenCabinet', name: 'Pastel Lilac Chest', category: 'Bedroom', x: 280, y: 120, elevation: 0, angle: 0, width: 70, depth: 50, height: 110, model: 'procedural:cabinet:{"columns":1,"rows":2,"doorType":"drawers","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#c7d2fe', floorLevel: 0 },
    { id: 'sf_desk', catalogId: 'squareTable', name: 'Modern Black Study Desk', category: 'Bedroom', x: 410, y: 230, elevation: 0, angle: 0, width: 130, depth: 65, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#18181b', floorLevel: 0 },
    { id: 'sf_stool', catalogId: 'chair', name: 'Round Lavender Task Stool', category: 'Bedroom', x: 410, y: 285, elevation: 0, angle: 0, width: 40, depth: 40, height: 45, model: 'procedural:chair:{"backrestStyle":"backless","seatType":"cushioned","legStyle":"straight_4"}', icon: '/models/chair.png', color: '#a5b4fc', floorLevel: 0 },
    { id: 'sf_bradiator', catalogId: 'radiator', name: 'Bedroom Wall Radiator', category: 'Bathroom', x: 544, y: 330, elevation: 15, angle: -Math.PI / 2, width: 65, depth: 10, height: 60, model: 'procedural:radiator:{}', icon: '/models/tvUnit.png', color: '#ffffff', floorLevel: 0, placementType: 'wall' },
    { id: 'sf_lamp', catalogId: 'tableLamp', name: 'Gooseneck Study Desk Lamp', category: 'Lighting', x: 450, y: 215, elevation: 75, angle: 0, width: 25, depth: 25, height: 42, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":22,"shadeHeight":18,"totalHeight":42}', icon: '/models/pendantLamp.png', color: '#18181b', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'sf_bed_win', catalogId: 'windowModernSliding', name: 'Bedroom Window', category: 'Doors & Windows', x: 550, y: 230, elevation: 90, angle: -Math.PI / 2, width: 100, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // --- 1ST FLOOR ITEMS (Duplex Penthouse Master Suite & Spa Bath) ---
    // Master Bedroom Suite (Left Wing)
    { id: 'sf8', catalogId: 'bed140x190', name: 'Penthouse Tufted Queen Bed', category: 'Bedroom', x: -330, y: 0, elevation: 0, angle: Math.PI / 2, width: 160, depth: 200, height: 95, model: 'procedural:bed:{"headboardStyle":"tufted","frameStyle":"platform"}', icon: '/models/bed140x190.png', color: '#475569', floorLevel: 1 },
    { id: 'sf_up_win_west', catalogId: 'windowModernSliding', name: 'Master Bedroom West Window', category: 'Doors & Windows', x: -550, y: 0, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_win_north_bed', catalogId: 'windowModernSliding', name: 'Master Bedroom North Window', category: 'Doors & Windows', x: -330, y: -380, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_win_south_bed', catalogId: 'windowModernSliding', name: 'Master Bedroom South Window', category: 'Doors & Windows', x: -330, y: 380, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_door_bed', catalogId: 'doorModernFlush', name: 'Master Suite Passage Door', category: 'Doors & Windows', x: -110, y: -160, elevation: 0, angle: Math.PI / 2, width: 85, depth: 10, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 1 },

    // Penthouse Spa Bath & Executive Lounge (Right Wing)
    { id: 'sf_up_door_bath', catalogId: 'doorModernFlush', name: 'Penthouse Bath Passage Door', category: 'Doors & Windows', x: 50, y: -160, elevation: 0, angle: Math.PI / 2, width: 85, depth: 10, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf10', catalogId: 'bath', name: 'Luxury Bathtub', category: 'Bathroom', x: 420, y: -240, elevation: 0, angle: 0, width: 170, depth: 75, height: 55, model: 'procedural:bath:{}', icon: '/models/bath.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf6', catalogId: 'toiletUnit', name: 'Modern Porcelain Toilet', category: 'Bathroom', x: 480, y: -130, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 65, height: 75, model: 'procedural:toilet:{}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_desk', catalogId: 'squareTable', name: 'Penthouse Executive Study Desk', category: 'Bedroom', x: 300, y: 220, elevation: 0, angle: 0, width: 130, depth: 65, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#18181b', floorLevel: 1 },
    { id: 'sf_up_chair', catalogId: 'chair', name: 'Executive Swivel Desk Chair', category: 'Bedroom', x: 300, y: 275, elevation: 0, angle: 0, width: 55, depth: 55, height: 90, model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"cushioned","legStyle":"swivel_pedestal"}', icon: '/models/chair.png', color: '#475569', floorLevel: 1 },
    { id: 'sf_up_door_balcony', catalogId: 'doorModernFlush', name: 'South Balcony French Door', category: 'Doors & Windows', x: 300, y: 380, elevation: 0, angle: 0, width: 110, depth: 12, height: 215, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_win_north_bath', catalogId: 'windowModernSliding', name: 'Penthouse North Window', category: 'Doors & Windows', x: 300, y: -380, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'sf_up_win_east', catalogId: 'windowModernSliding', name: 'Penthouse East Window', category: 'Doors & Windows', x: 550, y: -240, elevation: 90, angle: -Math.PI / 2, width: 100, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
  ],
  rooms: [
    {
      id: 'sr1',
      name: 'Living & Dining Room',
      floorLevel: 0,
      points: [{ x: -550, y: -380 }, { x: -110, y: -380 }, { x: -110, y: 380 }, { x: -550, y: 380 }],
      floorColor: '#0f5a65', // DecoFrog 3D Deep Teal Carpet
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 33.4,
    },
    {
      id: 'sr2',
      name: 'Corridor',
      floorLevel: 0,
      points: [{ x: -110, y: -380 }, { x: 50, y: -380 }, { x: 50, y: 380 }, { x: -110, y: 380 }],
      floorColor: '#0f5a65', // DecoFrog 3D Deep Teal
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 12.2,
    },
    {
      id: 'sr3',
      name: 'Kitchen & Dining',
      floorLevel: 0,
      points: [{ x: 50, y: -380 }, { x: 550, y: -380 }, { x: 550, y: -80 }, { x: 50, y: -80 }],
      floorColor: '#f59e0b', // DecoFrog 3D Warm Golden Parquet
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 15.0,
    },
    {
      id: 'sr4',
      name: 'Utility Room',
      floorLevel: 0,
      points: [{ x: 50, y: -80 }, { x: 550, y: -80 }, { x: 550, y: 60 }, { x: 50, y: 60 }],
      floorColor: '#a89a8c', // DecoFrog 3D Warm Taupe / Sand
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 7.0,
    },
    {
      id: 'sr5',
      name: 'Pink Bedroom & Study',
      floorLevel: 0,
      points: [{ x: 50, y: 60 }, { x: 550, y: 60 }, { x: 550, y: 380 }, { x: 50, y: 380 }],
      floorColor: '#e2d9f3', // DecoFrog 3D Pastel Lilac / Lavender
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 16.0,
    },
    // Upper Floor Rooms (Penthouse Suite - Structurally Aligned 11m x 7.6m Envelope)
    {
      id: 'sr_up_bed',
      name: 'Penthouse Master Suite',
      floorLevel: 1,
      points: [{ x: -550, y: -380 }, { x: -110, y: -380 }, { x: -110, y: 380 }, { x: -550, y: 380 }],
      floorColor: '#fbcfe8', // DecoFrog 3D Soft Rose Silk Carpet
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 33.4,
    },
    {
      id: 'sr_up_gallery',
      name: 'Upper Mezzanine Gallery',
      floorLevel: 1,
      points: [{ x: -110, y: -380 }, { x: 50, y: -380 }, { x: 50, y: 380 }, { x: -110, y: 380 }],
      floorColor: '#0f5a65', // Matching Deep Teal Carpet
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 12.2,
    },
    {
      id: 'sr_up_bath',
      name: 'Penthouse Bath & Lounge',
      floorLevel: 1,
      points: [{ x: 50, y: -380 }, { x: 550, y: -380 }, { x: 550, y: 380 }, { x: 50, y: 380 }],
      floorColor: '#e0e7ff', // Periwinkle Spa Tile
      ceilingColor: '#ffffff',
      ceilingHeight: 260,
      areaSquareMeters: 38.0,
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

export const sampleDefaultPlan: HomePlan = referenceLuxuryPlan;

export const ALL_CLIENT_PLANS: Record<string, HomePlan> = {
  'plan_reference_30x42_luxury': referenceLuxuryPlan,
  'plan-sarah-suite': sarahPlan,
  'plan-david-villa': davidPlan,
  'plan-emma-studio': emmaPlan,
};

export const fallbackCatalog: CatalogItem[] = [
  // ==========================================
  // 1. LIVING ROOM & ENTERTAINMENT
  // ==========================================
  {
    id: 'sofa',
    name: 'Corner Sectional L-Shape Sofa',
    category: 'Living',
    width: 240,
    depth: 160,
    height: 85,
    model: '/models/cornerSofa.obj',
    icon: '/models/cornerSofa.png',
    defaultColor: '#0284c7',
    description: 'Spacious modern L-shaped fabric sectional sofa with deep plump cushions and reversible chaise'
  },
  {
    id: 'sofa3Seater',
    name: '3-Seater Chesterfield Velvet Sofa',
    category: 'Living',
    width: 210,
    depth: 90,
    height: 85,
    model: '/models/sofa.obj',
    icon: '/models/sofa.png',
    defaultColor: '#0f766e',
    description: 'Classic luxury 3-seater deep-button tufted velvet sofa with rolled scroll arms and dark walnut legs'
  },
  {
    id: 'loveseat2Seater',
    name: '2-Seater Modern Scandinavian Loveseat',
    category: 'Living',
    width: 160,
    depth: 85,
    height: 82,
    model: 'procedural:sofa:{"type":"straight_2_seater","cushionStyle":"plump","armStyle":"track_arm","legStyle":"wooden_pegs"}',
    icon: '/models/sofa.png',
    defaultColor: '#d97706',
    description: 'Cozy two-seater upholstered loveseat featuring tailored piping and flared solid oak legs'
  },
  {
    id: 'reclinerLounge',
    name: 'Ergonomic Lounge Recliner & Footstool',
    category: 'Living',
    width: 95,
    depth: 90,
    height: 100,
    model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"wingback","legStyle":"swivel_pedestal"}',
    icon: '/models/armchair.png',
    defaultColor: '#78350f',
    description: 'Executive leather swivel lounge recliner with matching ergonomic ottoman footrest'
  },
  {
    id: 'armchair',
    name: 'Mid-Century Accent Armchair',
    category: 'Living',
    width: 85,
    depth: 85,
    height: 80,
    model: '/models/armchair.obj',
    icon: '/models/armchair.png',
    defaultColor: '#065f46',
    description: 'Comfortable mid-century modern accent armchair with tailored upholstery and tapered wood legs'
  },
  {
    id: 'roundTable',
    name: 'Round Italian Carrara Coffee Table',
    category: 'Living',
    width: 90,
    depth: 90,
    height: 45,
    model: '/models/roundTable.obj',
    icon: '/models/roundTable.png',
    defaultColor: '#f8fafc',
    description: 'Sculptural circular coffee table with polished Carrara marble top and brushed brass pedestal base'
  },
  {
    id: 'coffeeTableWood',
    name: 'Rectangular Oak Coffee Table with Shelf',
    category: 'Living',
    width: 120,
    depth: 60,
    height: 45,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":3.5,"legThickness":4.5,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#b45309',
    description: 'Natural solid oak rectangular coffee table with lower slatted magazine and book storage shelf'
  },
  {
    id: 'sideTableEnd',
    name: 'Sofa End Side Table',
    category: 'Living',
    width: 48,
    depth: 48,
    height: 55,
    model: 'procedural:table:{"shape":"round","legStyle":"pedestal_column","topThickness":2.5,"legThickness":3.5,"bevel":true}',
    icon: '/models/roundTable.png',
    defaultColor: '#1e293b',
    description: 'Compact circular side table for placing next to sofas and armchairs with brass rim'
  },
  {
    id: 'tvUnit',
    name: '65" Smart OLED TV & Lowline Console',
    category: 'Living',
    width: 180,
    depth: 45,
    height: 60,
    model: '/models/tvUnit.obj',
    icon: '/models/tvUnit.png',
    defaultColor: '#0f172a',
    description: 'Ultra-slim 65-inch 4K OLED television mounted above a low-profile media credenza console'
  },
  {
    id: 'tvWallUnit',
    name: 'Grand Entertainment Wall Center',
    category: 'Living',
    width: 240,
    depth: 45,
    height: 195,
    model: 'procedural:cabinet:{"columns":3,"rows":3,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/bookcase.png',
    defaultColor: '#334155',
    description: 'Architectural full-wall entertainment unit with TV cavity, open display niches, and bottom soft-close cabinets'
  },
  {
    id: 'soundbarSystem',
    name: 'Dolby Atmos Soundbar & Subwoofer',
    category: 'Living',
    width: 105,
    depth: 12,
    height: 8,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":8,"legThickness":0,"bevel":true}',
    icon: '/models/tvUnit.png',
    defaultColor: '#09090b',
    description: 'Premium wireless home theater soundbar with acoustic fabric mesh and wireless subwoofer'
  },
  {
    id: 'bookcase',
    name: 'Tall 5-Tier Library Bookcase',
    category: 'Living',
    width: 90,
    depth: 35,
    height: 190,
    model: '/models/bookcase.obj',
    icon: '/models/bookcase.png',
    defaultColor: '#78350f',
    description: 'Floor-standing 5-shelf solid wood bookcase for books, art objects, and pottery'
  },
  {
    id: 'displayCabinet',
    name: 'Glass Curio Display Cabinet',
    category: 'Living',
    width: 95,
    depth: 42,
    height: 185,
    model: 'procedural:cabinet:{"columns":2,"rows":3,"doorType":"glass_doors","hasLegs":true}',
    icon: '/models/bookcase.png',
    defaultColor: '#1e293b',
    description: 'Double tempered glass door display cabinet with integrated warm LED interior illumination'
  },
  {
    id: 'fireplace',
    name: 'Modern Electric Fireplace Mantle',
    category: 'Living',
    width: 130,
    depth: 35,
    height: 100,
    model: 'procedural:wallDesign:{"type":"brick_cladding"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#18181b',
    description: 'Contemporary electric LED flame fireplace suite with realistic glowing ember bed and white surround'
  },
  {
    id: 'piano',
    name: 'Grand Concert Piano',
    category: 'Living',
    width: 150,
    depth: 160,
    height: 100,
    model: '/models/piano.obj',
    icon: '/models/piano.png',
    defaultColor: '#09090b',
    description: 'Polished ebony black grand concert piano with 88 weighted keys and music rack'
  },
  {
    id: 'consoleTable',
    name: 'Entryway Foyer Console Table',
    category: 'Living',
    width: 120,
    depth: 36,
    height: 80,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":3,"legThickness":3.5,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#92400e',
    description: 'Slim hall console table with marble top and brass leg frame for keys, bowls, and table lamps'
  },

  // ==========================================
  // 2. DINING ROOM & BAR
  // ==========================================
  {
    id: 'squareTable',
    name: '6-Seater Solid Oak Dining Table',
    category: 'Kitchen',
    width: 160,
    depth: 90,
    height: 75,
    model: '/models/squareTable.obj',
    icon: '/models/squareTable.png',
    defaultColor: '#b45309',
    description: 'Generous 6-seater rectangular solid white oak dining table with beveled edge profile'
  },
  {
    id: 'diningTable8Seater',
    name: '8-Seater Grand Banquet Dining Table',
    category: 'Kitchen',
    width: 220,
    depth: 100,
    height: 75,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"trestle_base","topThickness":4.5,"legThickness":8,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#5c3d2e',
    description: 'Substantial 8-seater smoked walnut dining banquet table with sturdy architectural trestle base'
  },
  {
    id: 'roundDiningTable',
    name: '4-Seater Round Bistro Dining Table',
    category: 'Kitchen',
    width: 115,
    depth: 115,
    height: 75,
    model: 'procedural:table:{"shape":"round","legStyle":"pedestal_column","topThickness":3.5,"legThickness":6,"bevel":true}',
    icon: '/models/roundTable.png',
    defaultColor: '#f8fafc',
    description: 'Classic circular dining table comfortably seating 4 with tulip trumpet central pedestal'
  },
  {
    id: 'chair',
    name: 'Spindle Dining Chair',
    category: 'Kitchen',
    width: 48,
    depth: 48,
    height: 90,
    model: '/models/chair.obj',
    icon: '/models/chair.png',
    defaultColor: '#92400e',
    description: 'Windsor style solid beech dining chair with flared spindle slats and shaped saddle seat'
  },
  {
    id: 'chairUpholstered',
    name: 'Modern Velvet Dining Chair',
    category: 'Kitchen',
    width: 52,
    depth: 54,
    height: 88,
    model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"solid_panel","legStyle":"straight_4"}',
    icon: '/models/chair.png',
    defaultColor: '#0284c7',
    description: 'Plush velvet upholstered dining chair with curved supportive ergonomic back and brass leg ferrules'
  },
  {
    id: 'stool',
    name: 'Bar Counter Stool',
    category: 'Kitchen',
    width: 42,
    depth: 42,
    height: 78,
    model: '/models/stool.obj',
    icon: '/models/stool.png',
    defaultColor: '#78350f',
    description: 'Tall bar height stool with circular solid timber seat and integrated steel footrest ring'
  },
  {
    id: 'counterStoolBack',
    name: 'Swivel Kitchen Island Stool with Back',
    category: 'Kitchen',
    width: 46,
    depth: 48,
    height: 92,
    model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"solid_panel","legStyle":"swivel_pedestal"}',
    icon: '/models/stool.png',
    defaultColor: '#334155',
    description: 'Kitchen counter height 360-degree swivel stool with padded faux leather seat and supportive mid-back'
  },
  {
    id: 'sideboardBuffet',
    name: 'Dining Buffet Credenza Sideboard',
    category: 'Kitchen',
    width: 160,
    depth: 45,
    height: 85,
    model: 'procedural:cabinet:{"columns":3,"rows":2,"doorType":"solid_doors","hasLegs":true}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#78350f',
    description: '3-door dining room sideboard credenza for storing dinnerware, linens, and serving platters'
  },
  {
    id: 'barCart',
    name: 'Mobile Brass Wine & Cocktail Bar Cart',
    category: 'Kitchen',
    width: 80,
    depth: 45,
    height: 82,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":2,"legThickness":2.5,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#eab308',
    description: 'Two-tier rolling drinks trolley cart with mirrored glass shelves, bottle racks, and brass caster wheels'
  },
  {
    id: 'dinnerSet',
    name: 'Fine Dining Porcelain Table Setting',
    category: 'Kitchen',
    width: 60,
    depth: 40,
    height: 12,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":2,"legThickness":2,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#ffffff',
    description: 'Complete 4-piece ceramic dinner plate setting with polished stainless steel cutlery and cloth napkin'
  },

  // ==========================================
  // 3. KITCHEN & APPLIANCES
  // ==========================================
  {
    id: 'kitchenCabinet',
    name: 'Kitchen Modular Base Counter Unit',
    category: 'Kitchen',
    width: 120,
    depth: 60,
    height: 85,
    model: '/models/kitchenCabinet.obj',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#f8fafc',
    description: 'Seamless modular kitchen base cabinet with quartz stone countertop and soft-close storage drawers'
  },
  {
    id: 'kitchenWallCabinet',
    name: 'Overhead Kitchen Wall Cabinet',
    category: 'Kitchen',
    width: 120,
    depth: 35,
    height: 70,
    elevation: 145,
    placementType: 'wall',
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#f1f5f9',
    description: 'Overhead wall-mounted kitchen storage cabinet with concealed under-cabinet task LED strip channels'
  },
  {
    id: 'kitchenPantryTall',
    name: 'Full Height Kitchen Pantry Larder Tower',
    category: 'Kitchen',
    width: 65,
    depth: 60,
    height: 215,
    model: 'procedural:cabinet:{"columns":1,"rows":3,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/wardrobe.png',
    defaultColor: '#1e293b',
    description: 'Floor-to-ceiling kitchen pantry unit with pull-out chrome wire basket organizer shelving'
  },
  {
    id: 'kitchenIsland',
    name: 'Kitchen Central Waterfall Island',
    category: 'Kitchen',
    width: 180,
    depth: 90,
    height: 90,
    model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#e2e8f0',
    description: 'Grand freestanding kitchen center island with mitered waterfall quartz edges and overhang breakfast bar'
  },
  {
    id: 'kitchenArchedGlassWall',
    name: 'Parisian Arched Reeded Glass Wall Cabinet',
    category: 'Kitchen',
    width: 100,
    depth: 36,
    height: 85,
    elevation: 140,
    placementType: 'wall',
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"arched_glass","hasLegs":false,"hasCrown":true,"underLighting":true}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#4d6059',
    description: 'Transitional cottage wall cabinet with dual Roman arched reeded glass doors, interior display shelving, and warm 2700K task LED strip'
  },
  {
    id: 'kitchenArchedBase',
    name: 'Bespoke Arched Inset Base Cabinet',
    category: 'Kitchen',
    width: 120,
    depth: 62,
    height: 88,
    model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#4d6059',
    description: 'Luxury kitchen base unit with micro-beveled Roman arched wood panel doors, Calacatta Gold marble countertop, and knurled brass T-bar pulls'
  },
  {
    id: 'kitchenPantryArched',
    name: 'Grand Arched Parisian Pantry Larder Tower',
    category: 'Kitchen',
    width: 80,
    depth: 62,
    height: 220,
    model: 'procedural:cabinet:{"columns":2,"rows":4,"doorType":"arched_glass","hasLegs":false,"hasCrown":true}',
    icon: '/models/wardrobe.png',
    defaultColor: '#4d6059',
    description: 'Statement floor-to-ceiling kitchen pantry larder featuring two tall Roman arched glass doors, stepped crown cornice, and multi-tier oak shelving'
  },
  {
    id: 'kitchenIslandArched',
    name: 'Fluted Arched Waterfall Kitchen Island',
    category: 'Kitchen',
    width: 180,
    depth: 95,
    height: 90,
    model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#c29f79',
    description: 'Architectural center kitchen island with Roman arched inset panel cabinetry, knurled brass hardware, and thick Calacatta quartz waterfall overhang'
  },
  {
    id: 'kitchenArchedNiche',
    name: 'Built-in Arched Architectural Display Alcove',
    category: 'Kitchen',
    width: 75,
    depth: 35,
    height: 120,
    elevation: 90,
    placementType: 'wall',
    model: 'procedural:cabinet:{"columns":1,"rows":3,"doorType":"arched_niche","hasLegs":false}',
    icon: '/models/bookcase.png',
    defaultColor: '#f7f5f0',
    description: 'Recessed open architectural wall niche with Roman arch header, natural timber shelves, and integrated warm cove display lighting'
  },
  {
    id: 'kitchenBarStoolArched',
    name: 'Fluted Bouclé Arched Counter Stool',
    category: 'Kitchen',
    width: 48,
    depth: 48,
    height: 95,
    model: 'procedural:chair:{"backrestStyle":"rounded_barrel","seatType":"cushioned","legStyle":"4_legs_corner"}',
    icon: '/models/chair.png',
    defaultColor: '#f5f5f0',
    description: 'Luxury counter-height bar stool with curved cream bouclé backrest, cushioned seat, and satin brushed brass legs with footrest ring'
  },
  {
    id: 'kitchenPlasterHood',
    name: 'Architectural Arched Plaster Range Hood',
    category: 'Kitchen',
    width: 90,
    depth: 52,
    height: 90,
    elevation: 150,
    placementType: 'wall',
    model: 'procedural:lamp:{"type":"pendant_cone","shadeWidth":90,"shadeHeight":45,"totalHeight":90}',
    icon: '/models/cooker.png',
    defaultColor: '#f8fafc',
    description: 'Custom architectural curved plaster kitchen vent hood canopy with Roman arch taper and satin brushed brass trim'
  },
  {
    id: 'kitchenBelfastSink',
    name: 'Fluted Apron Belfast Sink & Brass Bridge Faucet',
    category: 'Kitchen',
    width: 90,
    depth: 65,
    height: 88,
    model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":false,"countertop":true}',
    icon: '/models/sink.png',
    defaultColor: '#ffffff',
    description: 'Fireclay fluted farmhouse apron-front sink set within custom cabinetry with gooseneck brushed brass bridge tap'
  },
  {
    id: 'flutedCredenza',
    name: 'Arched Fluted Oak Sideboard Credenza',
    category: 'Living',
    width: 180,
    depth: 48,
    height: 80,
    model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":true}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#c29f79',
    description: 'Bespoke tambour fluted white oak credenza sideboard with curved pill profile, brushed brass feet, and marble top'
  },
  {
    id: 'kitchenSink',
    name: 'Double Bowl Stainless Kitchen Sink',
    category: 'Kitchen',
    width: 90,
    depth: 60,
    height: 85,
    model: '/models/sink.obj',
    icon: '/models/sink.png',
    defaultColor: '#e2e8f0',
    description: 'Dual bowl undermount stainless steel kitchen sink with pull-out 360-degree gooseneck spray mixer'
  },
  {
    id: 'cooker',
    name: 'Induction Cooktop Stove & Convection Oven',
    category: 'Kitchen',
    width: 75,
    depth: 65,
    height: 85,
    model: '/models/cooker.obj',
    icon: '/models/cooker.png',
    defaultColor: '#0f172a',
    description: 'Professional 4-zone ceramic induction cooking range with panoramic window fan-forced convection oven'
  },
  {
    id: 'kitchenChimney',
    name: 'Stainless Steel Range Hood Chimney',
    category: 'Kitchen',
    width: 90,
    depth: 50,
    height: 80,
    elevation: 150,
    placementType: 'wall',
    model: 'procedural:lamp:{"type":"pendant_cone","shadeWidth":85,"shadeHeight":35,"totalHeight":80}',
    icon: '/models/cooker.png',
    defaultColor: '#cbd5e1',
    description: 'High-suction baffle filter wall-mounted kitchen chimney with dual LED cooktop illumination'
  },
  {
    id: 'refrigerator',
    name: 'French Door Stainless Double Refrigerator',
    category: 'Kitchen',
    width: 95,
    depth: 80,
    height: 185,
    model: '/models/fridgeFreezer.obj',
    icon: '/models/fridge.png',
    defaultColor: '#cbd5e1',
    description: 'Counter-depth French 4-door stainless steel refrigerator with filtered ice and water door dispenser'
  },
  {
    id: 'dishwasher',
    name: 'Built-in Automatic Dishwasher',
    category: 'Kitchen',
    width: 60,
    depth: 60,
    height: 85,
    model: '/models/dishwasher.obj',
    icon: '/models/dishwasher.png',
    defaultColor: '#e2e8f0',
    description: 'Integrated ultra-quiet 14-place setting dishwasher with top hidden electronic touch controls'
  },
  {
    id: 'microwave',
    name: 'Countertop Digital Microwave Oven',
    category: 'Kitchen',
    width: 52,
    depth: 38,
    height: 32,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:appliance:{"type":"microwave"}',
    icon: '/models/cooker.png',
    defaultColor: '#1e293b',
    description: 'Touch-control 1000W inverter microwave oven with grill and auto-defrost sensor'
  },
  {
    id: 'coffeeMachine',
    name: 'Countertop Italian Espresso Machine',
    category: 'Kitchen',
    width: 32,
    depth: 35,
    height: 38,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:decor:{"type":"potted_plant"}',
    icon: '/models/cooker.png',
    defaultColor: '#e2e8f0',
    description: 'Barista dual-boiler 15-bar pump espresso machine with stainless steel milk steam wand'
  },
  {
    id: 'kitchenTrashBin',
    name: 'Dual Recycling & Trash Step Can',
    category: 'Kitchen',
    width: 45,
    depth: 35,
    height: 65,
    model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/kitchenCabinet.png',
    defaultColor: '#94a3b8',
    description: 'Brushed fingerprint-proof stainless steel hands-free foot pedal dual waste and recycling bin'
  },

  // ==========================================
  // 4. BEDROOM
  // ==========================================
  {
    id: 'bedKingTufted',
    name: 'King Size Tufted Master Bed (195x215)',
    category: 'Bedroom',
    width: 195,
    depth: 215,
    height: 120,
    model: 'procedural:bed:{"headboardStyle":"tufted","frameStyle":"upholstered_box","hasNightstands":false}',
    icon: '/models/bed140x190.png',
    defaultColor: '#334155',
    description: 'Grand King master bed with diamond-tufted tall upholstered headboard and premium mattress'
  },
  {
    id: 'bed140x190',
    name: 'Queen Platform Bed (160x205)',
    category: 'Bedroom',
    width: 160,
    depth: 205,
    height: 95,
    model: '/models/bed140x190.obj',
    icon: '/models/bed140x190.png',
    defaultColor: '#475569',
    description: 'Modern low-profile Queen platform bed with solid timber headboard and slatted base'
  },
  {
    id: 'bed90x190',
    name: 'Single / Twin Bed (100x200)',
    category: 'Bedroom',
    width: 100,
    depth: 200,
    height: 85,
    model: '/models/bed90x190.obj',
    icon: '/models/bed90x190.png',
    defaultColor: '#0284c7',
    description: 'Standard single adult / teenager bed with supportive slatted frame and foam mattress'
  },
  {
    id: 'bunkBed90x190',
    name: 'Kids Twin-over-Twin Bunk Bed',
    category: 'Bedroom',
    width: 105,
    depth: 205,
    height: 165,
    model: '/models/bunkBed90x190.obj',
    icon: '/models/bunkBed90x190.png',
    defaultColor: '#b45309',
    description: 'Solid pine wood 2-tier bunk bed with safety guardrails and sturdy side climbing ladder'
  },
  {
    id: 'loftBedHigh',
    name: 'High Sleeper Loft Bed with Study Desk',
    category: 'Bedroom',
    width: 105,
    depth: 205,
    height: 180,
    model: '/models/loftBed140x190.obj',
    icon: '/models/loftBed140x190.png',
    defaultColor: '#334155',
    description: 'Space-saving elevated loft bunk with integrated study desk and shelving underneath'
  },
  {
    id: 'babyCrib',
    name: 'Convertible Wooden Baby Nursery Crib',
    category: 'Bedroom',
    width: 140,
    depth: 75,
    height: 90,
    model: 'procedural:bed:{"headboardStyle":"wood_slat","frameStyle":"platform","hasNightstands":false}',
    icon: '/models/bed90x190.png',
    defaultColor: '#f8fafc',
    description: 'Safe non-toxic beechwood infant crib with adjustable mattress height and breathable vertical spindles'
  },
  {
    id: 'wardrobeSliding3D',
    name: '3-Door Full Mirror Sliding Wardrobe',
    category: 'Bedroom',
    width: 220,
    depth: 65,
    height: 215,
    model: 'procedural:cabinet:{"columns":3,"rows":2,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/wardrobe.png',
    defaultColor: '#e2e8f0',
    description: 'Large master bedroom 3-door sliding wardrobe with full-height mirrors, hanging rails, and internal drawers'
  },
  {
    id: 'wardrobe',
    name: '2-Door Timber Wardrobe Closet',
    category: 'Bedroom',
    width: 120,
    depth: 60,
    height: 200,
    model: '/models/wardrobe.obj',
    icon: '/models/wardrobe.png',
    defaultColor: '#475569',
    description: 'Classic double-door bedroom wardrobe with clothing hanging bar and upper storage shelf'
  },
  {
    id: 'bedsideTable',
    name: 'Nightstand Bedside Table with Drawers',
    category: 'Bedroom',
    width: 50,
    depth: 42,
    height: 55,
    model: '/models/bedsideTable.obj',
    icon: '/models/bedsideTable.png',
    defaultColor: '#78350f',
    description: 'Two-drawer bedside nightstand with brass bar pulls for table lamps and bedside accessories'
  },
  {
    id: 'dresser',
    name: '4-Drawer Bedroom Tallboy Dresser',
    category: 'Bedroom',
    width: 100,
    depth: 48,
    height: 105,
    model: '/models/chest.obj',
    icon: '/models/chest.png',
    defaultColor: '#78350f',
    description: 'Deep 4-drawer bedroom storage chest dresser with smooth metal runners'
  },
  {
    id: 'dressingTable',
    name: 'Vanity Dressing Desk with Lighted Mirror',
    category: 'Bedroom',
    width: 110,
    depth: 45,
    height: 135,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":3,"legThickness":3.5,"bevel":true}',
    icon: '/models/squareTable.png',
    defaultColor: '#f8fafc',
    description: 'Glamorous makeup vanity dressing console with illuminated circular Hollywood mirror and upholstered stool'
  },
  {
    id: 'bedEndBench',
    name: 'Bouclé Ottoman Storage Bench',
    category: 'Bedroom',
    width: 130,
    depth: 42,
    height: 45,
    model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"backless","legStyle":"straight_4"}',
    icon: '/models/stool.png',
    defaultColor: '#f1f5f9',
    description: 'Plush bouclé upholstered storage bench positioned at the foot of the bed for blankets and cushions'
  },
  {
    id: 'chevalMirror',
    name: 'Full-Length Cheval Floor Mirror',
    category: 'Bedroom',
    width: 55,
    depth: 45,
    height: 170,
    model: 'procedural:decor:{"type":"arched_mirror"}',
    icon: '/models/wardrobe.png',
    defaultColor: '#eab308',
    description: 'Free-standing adjustable tilt full-length dressing mirror with slender metal easel stand'
  },

  // ==========================================
  // 5. BATHROOM & LAUNDRY
  // ==========================================
  {
    id: 'bath',
    name: 'Luxury Freestanding Oval Soaking Tub',
    category: 'Bathroom',
    width: 175,
    depth: 80,
    height: 60,
    model: '/models/bath.obj',
    icon: '/models/bath.png',
    defaultColor: '#ffffff',
    description: 'Architectural pure white acrylic ergonomic freestanding oval bathtub with center pop-up waste'
  },
  {
    id: 'cornerBathtub',
    name: 'Corner Hydrotherapy Whirlpool Bathtub',
    category: 'Bathroom',
    width: 145,
    depth: 145,
    height: 60,
    model: '/models/fittedBath.obj',
    icon: '/models/fittedBath.png',
    defaultColor: '#ffffff',
    description: 'Spacious corner whirlpool bath with built-in ergonomic headrest and hydro-massage jets'
  },
  {
    id: 'showerCabin',
    name: 'Walk-in Glass Shower Stall Enclosure',
    category: 'Bathroom',
    width: 100,
    depth: 100,
    height: 215,
    model: '/models/shower.obj',
    icon: '/models/shower.png',
    defaultColor: '#e0f2fe',
    description: 'Frameless 10mm tempered glass shower cubicle with low-profile stone base and overhead rain showerhead'
  },
  {
    id: 'toiletUnit',
    name: 'Modern Wall-Hung Porcelain Toilet',
    category: 'Bathroom',
    width: 40,
    depth: 55,
    height: 42,
    elevation: 15,
    placementType: 'wall',
    model: '/models/toiletUnit.obj',
    icon: '/models/toiletUnit.png',
    defaultColor: '#ffffff',
    description: 'Rimless ceramic wall-mounted toilet commode with soft-close seat and concealed cistern dual flush'
  },
  {
    id: 'bidet',
    name: 'Porcelain Floor Bidet',
    category: 'Bathroom',
    width: 40,
    depth: 58,
    height: 42,
    model: '/models/toiletUnit.obj',
    icon: '/models/toiletUnit.png',
    defaultColor: '#ffffff',
    description: 'Floor-standing porcelain bathroom bidet with chrome mixer tap'
  },
  {
    id: 'washbasin',
    name: 'Single Basin Floating Vanity Unit',
    category: 'Bathroom',
    width: 90,
    depth: 50,
    height: 85,
    model: '/models/washbasinWithCabinet.obj',
    icon: '/models/washbasinWithCabinet.png',
    defaultColor: '#ffffff',
    description: 'Wall-mounted bathroom vanity featuring a solid surface integrated basin and deep soft-close towel drawers'
  },
  {
    id: 'doubleVanityBath',
    name: 'Master Double Basin Marble Vanity',
    category: 'Bathroom',
    width: 160,
    depth: 55,
    height: 85,
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"drawers","hasLegs":true}',
    icon: '/models/washbasinWithCabinet.png',
    defaultColor: '#f8fafc',
    description: 'Double master bathroom vanity console with dual undermount sinks and Italian marble countertop'
  },
  {
    id: 'radiator',
    name: 'Wall Heated Towel Warmer Radiator',
    category: 'Bathroom',
    width: 60,
    depth: 12,
    height: 110,
    elevation: 35,
    placementType: 'wall',
    model: '/models/hotWaterRadiator.obj',
    icon: '/models/electricRadiator.png',
    defaultColor: '#cbd5e1',
    description: 'Ladder style chrome heated towel rail radiator connected to central heating for warming bath sheets'
  },
  {
    id: 'washingMachine',
    name: 'Front-Load 9kg Automatic Washing Machine',
    category: 'Bathroom',
    width: 60,
    depth: 60,
    height: 85,
    model: '/models/clothesWasher.obj',
    icon: '/models/clothesWasher.png',
    defaultColor: '#f8fafc',
    description: 'Energy-star 9kg front-load automatic clothes washing machine with direct drive motor and digital display'
  },
  {
    id: 'clothesDryer',
    name: 'Front-Load Heat Pump Clothes Dryer',
    category: 'Bathroom',
    width: 60,
    depth: 60,
    height: 85,
    model: 'procedural:appliance:{"type":"dryer"}',
    icon: '/models/clothesWasher.png',
    defaultColor: '#e2e8f0',
    description: 'Efficient heat pump condenser tumble clothes dryer with sensor dry technology'
  },
  {
    id: 'laundryHamper',
    name: 'Bamboo Linen Laundry Hamper Basket',
    category: 'Bathroom',
    width: 45,
    depth: 35,
    height: 65,
    model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/roundTable.png',
    defaultColor: '#d4a373',
    description: 'Natural slatted bamboo clothes hamper with removable dual fabric liner bag and hinged lid'
  },
  {
    id: 'medicineCabinet',
    name: 'LED Mirrored Bathroom Medicine Cabinet',
    category: 'Bathroom',
    width: 80,
    depth: 15,
    height: 75,
    elevation: 125,
    placementType: 'wall',
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"glass_doors","hasLegs":false}',
    icon: '/models/pendantLamp.png',
    defaultColor: '#ffffff',
    description: 'Double mirrored door recessed medicine cabinet with adjustable glass shelves and built-in shaver socket'
  },
  {
    id: 'bathmat',
    name: 'Memory Foam Bathroom Floor Mat',
    category: 'Bathroom',
    width: 80,
    depth: 50,
    height: 2,
    model: 'procedural:decor:{"type":"area_rug"}',
    icon: '/models/roundTable.png',
    defaultColor: '#0ea5e9',
    description: 'Fast-drying non-slip microfiber bathroom floor runner mat'
  },
  {
    id: 'bathroomScale',
    name: 'Digital Tempered Glass Floor Scale',
    category: 'Bathroom',
    width: 30,
    depth: 30,
    height: 3,
    model: 'procedural:decor:{"type":"area_rug"}',
    icon: '/models/roundTable.png',
    defaultColor: '#334155',
    description: 'High-precision slim tempered glass bathroom body weight scale'
  },
  {
    id: 'hairDryer',
    name: 'Wall Mounted Professional Hair Dryer',
    category: 'Bathroom',
    width: 22,
    depth: 15,
    height: 28,
    elevation: 130,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"wall_art"}',
    icon: '/models/plant.png',
    defaultColor: '#f1f5f9',
    description: 'Wall-mounted hotel style ionic hair dryer with spiral cord holder'
  },

  // ==========================================
  // 6. HOME OFFICE & STUDY
  // ==========================================
  {
    id: 'deskExecutive',
    name: 'Executive L-Shaped Office Computer Desk',
    category: 'Office',
    width: 160,
    depth: 120,
    height: 75,
    model: 'procedural:desk:{}',
    icon: '/models/squareTable.png',
    defaultColor: '#1e293b',
    description: 'Large executive home office corner workstation with privacy modesty panel and integrated 3-drawer filing pedestal'
  },
  {
    id: 'deskCompact',
    name: 'Modern Writing & Study Desk',
    category: 'Office',
    width: 120,
    depth: 60,
    height: 75,
    model: 'procedural:desk:{}',
    icon: '/models/squareTable.png',
    defaultColor: '#b45309',
    description: 'Minimalist Scandinavian home study desk with solid oak legs and dual stationery pull drawers'
  },
  {
    id: 'officeChairErgo',
    name: 'Ergonomic Mesh Swivel Task Chair',
    category: 'Office',
    width: 65,
    depth: 65,
    height: 115,
    model: 'procedural:chair:{"seatType":"cushioned","backrestStyle":"solid_panel","legStyle":"swivel_pedestal"}',
    icon: '/models/chair.png',
    defaultColor: '#0f172a',
    description: 'High-back breathable mesh ergonomic office chair with adjustable lumbar support, 3D armrests, and roller wheels'
  },
  {
    id: 'computerDualMonitor',
    name: 'Dual 27" 4K Monitors & Workstation Setup',
    category: 'Office',
    width: 110,
    depth: 35,
    height: 50,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":45,"legThickness":0,"bevel":true}',
    icon: '/models/tvUnit.png',
    defaultColor: '#09090b',
    description: 'Twin 27-inch borderless IPS monitors on heavy desk clamp arm with mechanical keyboard and precision mouse'
  },
  {
    id: 'filingCabinet',
    name: '2-Drawer Steel Lockable Filing Cabinet',
    category: 'Office',
    width: 45,
    depth: 50,
    height: 70,
    model: 'procedural:cabinet:{"columns":1,"rows":2,"doorType":"drawers","hasLegs":true}',
    icon: '/models/chest.png',
    defaultColor: '#475569',
    description: 'Heavy gauge steel under-desk mobile filing cabinet for letter and legal files with master lock'
  },
  {
    id: 'studyBookcase',
    name: '4-Tier Office Bookcase Shelf',
    category: 'Office',
    width: 80,
    depth: 30,
    height: 160,
    model: '/models/bookcase.obj',
    icon: '/models/bookcase.png',
    defaultColor: '#334155',
    description: 'Open vertical steel frame bookshelf for binders, reference manuals, and desk accessories'
  },
  {
    id: 'workLamp',
    name: 'Articulated Architect Desk Work Lamp',
    category: 'Office',
    width: 20,
    depth: 35,
    height: 55,
    placementType: 'tabletop',
    placeOnTable: true,
    model: '/models/workLamp.obj',
    icon: '/models/workLamp.png',
    defaultColor: '#e11d48',
    description: 'Classic swing-arm metal task desk lamp with counterbalanced springs and 360-degree rotating head'
  },

  // ==========================================
  // 7. ENTRYWAY, UTILITY & ELECTRONICS
  // ==========================================
  {
    id: 'shoeRack',
    name: '3-Tier Slatted Wood Shoe Storage Bench',
    category: 'Storage',
    width: 90,
    depth: 35,
    height: 50,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"4_legs_corner","topThickness":5,"legThickness":3.5,"bevel":true}',
    icon: '/models/bookcase.png',
    defaultColor: '#92400e',
    description: 'Solid wood entryway shoe rack bench capable of storing 9 pairs of shoes with a top seating bench'
  },
  {
    id: 'hallTreeCoatRack',
    name: 'Entryway Hall Tree with Coat Hooks & Bench',
    category: 'Storage',
    width: 100,
    depth: 40,
    height: 185,
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"open_shelf","hasLegs":true}',
    icon: '/models/wardrobe.png',
    defaultColor: '#1e293b',
    description: 'All-in-one entryway organizer featuring 8 heavy metal coat hooks, seating bench, and lower wire shoe racks'
  },
  {
    id: 'splitAcIndoor',
    name: '1.5-Ton Inverter Split Air Conditioner',
    category: 'Appliances',
    width: 95,
    depth: 24,
    height: 30,
    elevation: 200,
    placementType: 'wall',
    model: 'procedural:appliance:{"type":"air_conditioner"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#f8fafc',
    description: 'Whisper-quiet wall-mounted inverter split air conditioning indoor unit with dual swing louvers'
  },
  {
    id: 'roomHeater',
    name: 'Portable 9-Fin Oil Radiator Heater',
    category: 'Appliances',
    width: 45,
    depth: 25,
    height: 65,
    model: '/models/electricRadiator.obj',
    icon: '/models/electricRadiator.png',
    defaultColor: '#ffffff',
    description: 'Mobile 9-fin oil filled electric space heater on caster wheels with thermostat dial'
  },
  {
    id: 'waterPurifier',
    name: 'RO Countertop Water Purifier & Dispenser',
    category: 'Appliances',
    width: 32,
    depth: 35,
    height: 45,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/cooker.png',
    defaultColor: '#0284c7',
    description: 'Multi-stage reverse osmosis countertop water purifier providing instant chilled and hot drinking water'
  },
  {
    id: 'ironingStation',
    name: 'Foldable Ironing Board & Steam Iron',
    category: 'Storage',
    width: 130,
    depth: 40,
    height: 85,
    model: 'procedural:table:{"shape":"oval","legStyle":"cross_x_legs","topThickness":2.5,"legThickness":2.5,"bevel":false}',
    icon: '/models/squareTable.png',
    defaultColor: '#64748b',
    description: 'Sturdy steel mesh height-adjustable ironing board with heat-resistant silicone iron rest plate'
  },
  {
    id: 'vacuumCleaner',
    name: 'Cordless Stick Vacuum Cleaner on Wall Dock',
    category: 'Appliances',
    width: 25,
    depth: 25,
    height: 115,
    placementType: 'wall',
    elevation: 20,
    model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":40,"totalHeight":115}',
    icon: '/models/plant.png',
    defaultColor: '#7c3aed',
    description: 'High-torque cordless stick vacuum cleaner clicked onto wall-mounted magnetic rapid charging dock'
  },

  // ==========================================
  // 8. BALCONY, PATIO & OUTDOOR
  // ==========================================
  {
    id: 'rattanPatioSet',
    name: '4-Piece Outdoor Wicker Patio Lounge Set',
    category: 'Outdoor & Garden',
    width: 220,
    depth: 150,
    height: 80,
    model: 'procedural:sofa:{"type":"l_shape_left","cushionStyle":"plump","armStyle":"track_arm","legStyle":"plinth"}',
    icon: '/models/cornerSofa.png',
    defaultColor: '#78350f',
    description: 'All-weather resin wicker outdoor conversation set including loveseat, two armchairs, and tempered glass coffee table'
  },
  {
    id: 'deckChair',
    name: 'Folding Timber Sun Lounger Deck Chair',
    category: 'Outdoor & Garden',
    width: 70,
    depth: 160,
    height: 75,
    model: 'procedural:table:{"shape":"rectangular","legStyle":"cross_x_legs","topThickness":3,"legThickness":3,"bevel":false}',
    icon: '/models/armchair.png',
    defaultColor: '#0284c7',
    description: 'Multi-position reclining outdoor teak sun lounger with soft waterproof cushion and rear wheels'
  },
  {
    id: 'hangingUmbrella',
    name: '3-Meter Cantilever Patio Shade Umbrella',
    category: 'Outdoor & Garden',
    width: 300,
    depth: 300,
    height: 260,
    model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":280,"shadeHeight":45,"totalHeight":260}',
    icon: '/models/roundTable.png',
    defaultColor: '#fef3c7',
    description: 'Heavy-duty 10-foot cantilever offset outdoor patio parasol with 360-degree rotation and granite cross base'
  },
  {
    id: 'eggSwingChair',
    name: 'Hanging Rattan Egg Pod Swing Chair',
    category: 'Outdoor & Garden',
    width: 105,
    depth: 105,
    height: 195,
    model: 'procedural:chair:{"seatType":"curved_shell","backrestStyle":"solid_panel","legStyle":"swivel_pedestal"}',
    icon: '/models/armchair.png',
    defaultColor: '#475569',
    description: 'Boho style suspended resin wicker egg pod swing chair suspended from heavy powder-coated steel arc stand'
  },
  {
    id: 'grillBBQ',
    name: 'Outdoor Stainless 4-Burner BBQ Smoker',
    category: 'Outdoor & Garden',
    width: 135,
    depth: 60,
    height: 115,
    model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":true}',
    icon: '/models/cooker.png',
    defaultColor: '#18181b',
    description: 'Commercial stainless steel barbecue cooking station with side burner, warming rack, and thermometer hood'
  },
  {
    id: 'gardenHut',
    name: 'Nordic Timber Garden Storage Shed',
    category: 'Outdoor & Garden',
    width: 220,
    depth: 200,
    height: 230,
    model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":false}',
    icon: '/models/bookcase.png',
    defaultColor: '#d4a373',
    description: 'Weatherproof interlocking pine log garden equipment shed with asphalt shingle gabled roof'
  },
  {
    id: 'fountain',
    name: 'Carved Tiered Stone Garden Fountain',
    category: 'Outdoor & Garden',
    width: 110,
    depth: 110,
    height: 120,
    model: 'procedural:lamp:{"type":"chandelier","shadeWidth":100,"shadeHeight":80,"totalHeight":120}',
    icon: '/models/roundTable.png',
    defaultColor: '#cbd5e1',
    description: 'Ornate 2-tier classical cast stone garden water fountain with recirculating electric pump'
  },

  // ==========================================
  // 9. KIDS & NURSERY
  // ==========================================
  {
    id: 'kidsStudyDesk',
    name: 'Kids Height-Adjustable Study Desk & Chair',
    category: 'Kids',
    width: 90,
    depth: 60,
    height: 75,
    model: 'procedural:desk:{}',
    icon: '/models/squareTable.png',
    defaultColor: '#38bdf8',
    description: 'Ergonomic tilt-desktop children study table with pull-out stationery drawer and posture support chair'
  },
  {
    id: 'toyOrganizer',
    name: 'Multi-Bin Toy Storage Organizer Chest',
    category: 'Kids',
    width: 95,
    depth: 35,
    height: 80,
    model: 'procedural:shelf:{"type":"modular_cubes"}',
    icon: '/models/bookcase.png',
    defaultColor: '#f59e0b',
    description: 'Sturdy wooden frame holding 9 interchangeable colorful plastic storage bins for toys, blocks, and games'
  },
  {
    id: 'kidsBookRack',
    name: 'Forward-Facing Kids Picture Book Display',
    category: 'Kids',
    width: 80,
    depth: 30,
    height: 75,
    model: 'procedural:shelf:{"type":"floating","plankThickness":3}',
    icon: '/models/bookcase.png',
    defaultColor: '#f8fafc',
    description: 'Low-profile montessori wooden bookshelf displaying front book covers within easy toddler reach'
  },

  // ==========================================
  // 10. LIGHTING & ATMOSPHERE
  // ==========================================
  {
    id: 'pendantLamp',
    name: 'Scandinavian Dome Pendant Ceiling Lamp',
    category: 'Lighting',
    width: 45,
    depth: 45,
    height: 65,
    model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":45,"shadeHeight":28,"totalHeight":65}',
    icon: '/models/pendantLamp.png',
    placementType: 'ceiling',
    lightIntensity: 1.4,
    defaultColor: '#38bdf8',
    description: 'Matte spun aluminum bowl pendant lamp providing directed warm downwards pool of light for dining and counters'
  },
  {
    id: 'ceilingFan',
    name: '52" Ceiling Fan with Integrated LED Light',
    category: 'Lighting',
    width: 132,
    depth: 132,
    height: 38,
    model: 'procedural:lamp:{"type":"ceiling_fan","shadeWidth":130,"shadeHeight":28,"totalHeight":38}',
    icon: '/models/pendantLamp.png',
    placementType: 'ceiling',
    lightIntensity: 1.2,
    defaultColor: '#334155',
    description: 'Modern whisper-quiet 5-blade DC motor ceiling fan with frosted glass dimmable LED light dome'
  },
  {
    id: 'chandelier',
    name: 'Luxury 3-Tier Crystal Glass Chandelier',
    category: 'Lighting',
    width: 85,
    depth: 85,
    height: 85,
    model: 'procedural:lamp:{"type":"chandelier","shadeWidth":80,"shadeHeight":70,"totalHeight":85}',
    icon: '/models/pendantLamp.png',
    placementType: 'ceiling',
    lightIntensity: 1.8,
    defaultColor: '#eab308',
    description: 'Dazzling multi-faceted K9 crystal prism chandelier with warm golden brass frame for grand entry and dining'
  },
  {
    id: 'recessedSpot',
    name: 'Recessed Ceiling LED Downlight Spotlight',
    category: 'Lighting',
    width: 18,
    depth: 18,
    height: 6,
    model: 'procedural:lamp:{"type":"recessed_spot","shadeWidth":16,"shadeHeight":4,"totalHeight":6}',
    icon: '/models/spotlight.png',
    placementType: 'ceiling',
    lightIntensity: 1.5,
    defaultColor: '#ffffff',
    description: 'Ultra-slim architectural flush recessed LED ceiling downlight delivering clean ambient glare-free illumination'
  },
  {
    id: 'ceilingFlush',
    name: 'Square Flush Minimalist Ceiling Light Panel',
    category: 'Lighting',
    width: 60,
    depth: 60,
    height: 8,
    model: 'procedural:lamp:{"type":"flush_panel","shadeWidth":56,"shadeHeight":6,"totalHeight":8}',
    icon: '/models/pendantLamp.png',
    placementType: 'ceiling',
    lightIntensity: 1.4,
    defaultColor: '#f8fafc',
    description: 'Sleek edge-lit LED square surface mount ceiling fixture for bedrooms, kitchens, and hallways'
  },
  {
    id: 'tableLamp',
    name: 'Bedside Table Lamp with Fabric Shade',
    category: 'Lighting',
    width: 32,
    depth: 32,
    height: 50,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":28,"shadeHeight":22,"totalHeight":50}',
    icon: '/models/pendantLamp.png',
    lightIntensity: 1.1,
    defaultColor: '#fef08a',
    description: 'Glazed ceramic vase table lamp with textured natural linen drum shade creating soft bedside reading glow'
  },
  {
    id: 'floorArcLamp',
    name: 'Stainless Steel Arc Floor Standing Lamp',
    category: 'Lighting',
    width: 40,
    depth: 160,
    height: 210,
    model: 'procedural:lamp:{"type":"floor_arc","shadeWidth":38,"shadeHeight":25,"totalHeight":210}',
    icon: '/models/floorUplight.png',
    lightIntensity: 1.3,
    defaultColor: '#cbd5e1',
    description: 'Sweeping cantilevered arch floor lamp anchored in a heavy Italian marble cylinder base'
  },
  {
    id: 'wallUplight',
    name: 'Contemporary Brass Dual-Beam Wall Sconce',
    category: 'Lighting',
    width: 15,
    depth: 18,
    height: 30,
    elevation: 175,
    placementType: 'wall',
    model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":22,"totalHeight":30}',
    icon: '/models/wallUplight.png',
    defaultColor: '#eab308',
    description: 'Minimalist brushed brass cylindrical wall sconce projecting architectural up-and-down grazing light'
  },

  // ==========================================
  // 11. DECOR, RUGS & PLANTS
  // ==========================================
  {
    id: 'decorWallArt',
    name: 'Large Framed Abstract Canvas Painting',
    category: 'Decor & Plants',
    width: 140,
    depth: 5,
    height: 90,
    elevation: 125,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"wall_art"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#0284c7',
    description: 'Museum-quality framed contemporary abstract acrylic canvas painting with floating black wood frame'
  },
  {
    id: 'decorArchedMirror',
    name: 'Tall Brass Arched Dressing Floor Mirror',
    category: 'Decor & Plants',
    width: 80,
    depth: 8,
    height: 185,
    model: 'procedural:decor:{"type":"arched_mirror"}',
    icon: '/models/wardrobe.png',
    defaultColor: '#eab308',
    description: 'Full-length arched standing dressing mirror with slender brushed antique brass metal casing'
  },
  {
    id: 'decorVanityMirror',
    name: 'Circular Backlit LED Bathroom Vanity Mirror',
    category: 'Decor & Plants',
    width: 80,
    depth: 6,
    height: 80,
    elevation: 120,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"vanity_mirror"}',
    icon: '/models/pendantLamp.png',
    defaultColor: '#ffffff',
    description: 'Frameless round vanity mirror featuring an ambient 3000K warm white LED halo backlight and demister pad'
  },
  {
    id: 'decorCurtains',
    name: 'Floor-to-Ceiling Pleated Linen Curtains',
    category: 'Decor & Plants',
    width: 200,
    depth: 15,
    height: 250,
    elevation: 0,
    placementType: 'wall',
    model: 'procedural:decor:{"type":"curtains"}',
    icon: '/models/wardrobe.png',
    defaultColor: '#f1f5f9',
    description: 'Luxurious wave-fold sheer and blackout dual curtain drapery suspended from ceiling concealed track'
  },
  {
    id: 'decorAreaRug',
    name: 'Plush Scandinavian Geometric Living Rug',
    category: 'Decor & Plants',
    width: 230,
    depth: 160,
    height: 2,
    model: 'procedural:decor:{"type":"area_rug"}',
    icon: '/models/roundTable.png',
    defaultColor: '#e2e8f0',
    description: 'Dense high-pile soft woven geometric area rug designed to anchor living room seating layouts'
  },
  {
    id: 'decorLargeRug',
    name: 'Grand Persian Medallion Bedroom Area Rug',
    category: 'Decor & Plants',
    width: 300,
    depth: 200,
    height: 2,
    model: 'procedural:decor:{"type":"area_rug"}',
    icon: '/models/roundTable.png',
    defaultColor: '#991b1b',
    description: 'Classic distressed Persian heritage wool weave rug with intricate floral borders and center medallion'
  },
  {
    id: 'decorPottedPlant',
    name: 'Indoor Monstera Deliciosa on Ceramic Pot',
    category: 'Decor & Plants',
    width: 65,
    depth: 65,
    height: 125,
    model: 'procedural:decor:{"type":"potted_plant"}',
    icon: '/models/plant.png',
    defaultColor: '#16a34a',
    description: 'Lush Swiss Cheese Monstera plant in a glazed cylindrical pot supported by a solid teak wood tripod stand'
  },
  {
    id: 'fiddleLeafFig',
    name: 'Tall Architectural Fiddle Leaf Fig Tree',
    category: 'Decor & Plants',
    width: 70,
    depth: 70,
    height: 175,
    model: '/models/plant.obj',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Striking floor-standing Ficus Lyrata indoor tree with broad violin-shaped leaves in a fiberclay planter'
  },
  {
    id: 'tableVase',
    name: 'Sculptural Ceramic Flower Table Vase',
    category: 'Decor & Plants',
    width: 25,
    depth: 25,
    height: 38,
    placementType: 'tabletop',
    placeOnTable: true,
    model: 'procedural:lamp:{"type":"globe_orb","shadeWidth":22,"shadeHeight":22,"totalHeight":38}',
    icon: '/models/plant.png',
    defaultColor: '#f8fafc',
    description: 'Artisan hand-thrown matte stoneware ceramic vase featuring dried pampas grass stems'
  },

  // ==========================================
  // 12. DOORS, WINDOWS, WALLS & STRUCTURAL
  // ==========================================
  {
    id: 'doorModernFlush',
    name: 'Modern Solid Timber Interior Flush Door',
    category: 'Doors & Windows',
    width: 90,
    depth: 10,
    height: 210,
    model: 'procedural:door:{"type":"modern_flush"}',
    icon: '/models/door.png',
    defaultColor: '#f1f5f9',
    description: 'Clean architectural solid core flush interior door with brushed nickel lever latch handle'
  },
  {
    id: 'doorBarnSliding',
    name: 'Rustic Sliding Barn Door with Steel Rail',
    category: 'Doors & Windows',
    width: 100,
    depth: 10,
    height: 215,
    model: 'procedural:door:{"type":"barn_sliding"}',
    icon: '/models/door.png',
    defaultColor: '#78350f',
    description: 'Cross-braced rustic timber sliding barn door with top-hung industrial black powder-coated wheel track'
  },
  {
    id: 'doorGlassFrench',
    name: 'Double Glass French Doors with Brass Knobs',
    category: 'Doors & Windows',
    width: 160,
    depth: 12,
    height: 215,
    model: 'procedural:door:{"type":"glass_french"}',
    icon: '/models/door.png',
    defaultColor: '#1e293b',
    description: 'Twin patio French doors with divided tempered glass panes, wooden mullions, and polished brass handles'
  },
  {
    id: 'doorArchedWood',
    name: 'Mediterranean Solid Wood Arched Door',
    category: 'Doors & Windows',
    width: 95,
    depth: 12,
    height: 220,
    model: 'procedural:door:{"type":"arched_wood"}',
    icon: '/models/door.png',
    defaultColor: '#92400e',
    description: 'Handcrafted Mediterranean arch-top solid timber entry door with forged iron hardware'
  },
  {
    id: 'windowModernSliding',
    name: 'Modern Sliding Double-Glazed Window',
    category: 'Doors & Windows',
    width: 140,
    depth: 15,
    height: 120,
    elevation: 90,
    defaultElevation: 90,
    placementType: 'wall',
    model: 'procedural:window:{"type":"modern_sliding"}',
    icon: '/models/window85x123.png',
    defaultColor: '#334155',
    description: 'Thermally broken aluminum sliding window with low-E insulated glass and wide internal window sill'
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
    description: 'Graceful architectural arched top casement window with radial decorative sunburst mullions'
  },
  {
    id: 'windowPanoramic',
    name: 'Floor-to-Ceiling Panoramic Picture Window',
    category: 'Doors & Windows',
    width: 220,
    depth: 15,
    height: 220,
    model: 'procedural:window:{"type":"picture_panoramic"}',
    icon: '/models/window85x123.png',
    defaultColor: '#0f172a',
    description: 'Extra-wide unobstructed fixed panoramic glass picture window capturing expansive natural light'
  },
  {
    id: 'windowGridDoubleHung',
    name: 'Colonial 6-Pane Double Hung Window',
    category: 'Doors & Windows',
    width: 95,
    depth: 15,
    height: 140,
    elevation: 80,
    defaultElevation: 80,
    placementType: 'wall',
    model: 'procedural:window:{"type":"grid_double_hung"}',
    icon: '/models/window85x123.png',
    defaultColor: '#f8fafc',
    description: 'Traditional American colonial 6-over-6 sash window with deep molded casing and exterior brickmold'
  },
  {
    id: 'wallWoodSlat',
    name: 'Acoustic Natural Oak Vertical Slat Wall',
    category: 'Wall Designs',
    width: 200,
    depth: 4,
    height: 250,
    model: 'procedural:wallDesign:{"type":"wood_slat"}',
    icon: '/models/bookcase.png',
    defaultColor: '#b45309',
    description: 'Modern sound-absorbing natural oak vertical wood slat wall cladding with dark acoustic felt backing'
  },
  {
    id: 'wallMarbleSlab',
    name: 'Calacatta Gold Marble Slab Wall Feature',
    category: 'Wall Designs',
    width: 200,
    depth: 4,
    height: 250,
    model: 'procedural:wallDesign:{"type":"marble_slab"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#f8fafc',
    description: 'Large-format polished Calacatta gold bookmatched marble slab accent wall with brushed brass vertical trim strips'
  },
  {
    id: 'wallWainscoting',
    name: 'Classic Recessed Panel Wainscoting',
    category: 'Wall Designs',
    width: 200,
    depth: 4,
    height: 110,
    model: 'procedural:wallDesign:{"type":"wainscoting"}',
    icon: '/models/bookcase.png',
    defaultColor: '#ffffff',
    description: 'Traditional dining and hallway wall wainscoting with classic picture-frame moldings and molded chair rail'
  },
  {
    id: 'wallBrickCladding',
    name: 'Industrial Exposed Red Loft Brick Wall',
    category: 'Wall Designs',
    width: 200,
    depth: 5,
    height: 250,
    model: 'procedural:wallDesign:{"type":"brick_cladding"}',
    icon: '/models/tvUnit.png',
    defaultColor: '#991b1b',
    description: 'Authentic reclaimed urban loft red clay brick wall cladding with rustic weathered lime mortar joints'
  },
  {
    id: 'staircaseDuplexFloating',
    name: 'Duplex Luxury Floating Glass Staircase',
    category: 'Stairs & Structural',
    width: 100,
    depth: 260,
    height: 260,
    model: 'procedural:stairs:{"type":"floating","stepsCount":14,"hasHandrail":true,"railingStyle":"glass"}',
    icon: '/models/staircase.png',
    defaultColor: '#d4a373',
    description: 'Cantilevered solid European oak treads with concealed wall anchors, step LED glow, and frameless safety glass'
  },
  {
    id: 'staircaseDuplexLShape',
    name: 'Duplex L-Shaped Staircase with Landing',
    category: 'Stairs & Structural',
    width: 140,
    depth: 230,
    height: 260,
    model: 'procedural:stairs:{"type":"l_shape","stepsCount":14,"hasHandrail":true,"closedRisers":true}',
    icon: '/models/staircase.png',
    defaultColor: '#78350f',
    description: 'Graceful 90-degree corner staircase featuring intermediate rest landing and continuous molded wooden handrail'
  },
  {
    id: 'staircaseDuplexOpenRiser',
    name: 'Duplex Architectural Open-Riser Flight',
    category: 'Stairs & Structural',
    width: 100,
    depth: 240,
    height: 260,
    model: 'procedural:stairs:{"type":"open_riser","stepsCount":14,"hasHandrail":true,"railingStyle":"cable_wire"}',
    icon: '/models/staircase.png',
    defaultColor: '#b45309',
    description: 'Modern open flight with dual matte black steel stringers, solid timber treads, and marine grade stainless cable railings'
  },
  {
    id: 'staircaseSpiral',
    name: 'Duplex Helical Spiral Staircase',
    category: 'Stairs & Structural',
    width: 140,
    depth: 140,
    height: 260,
    model: 'procedural:stairs:{"type":"spiral","stepsCount":16,"hasHandrail":true}',
    icon: '/models/curveStaircase.png',
    defaultColor: '#d4a373',
    description: 'Sculptural compact circular spiral staircase with center steel support column and radiating oak steps'
  },
  {
    id: 'staircaseOutdoorConcrete',
    name: 'Exterior Solid Stone Entry Steps',
    category: 'Stairs & Structural',
    width: 130,
    depth: 180,
    height: 120,
    model: 'procedural:stairs:{"type":"outdoor_concrete","stepsCount":6,"hasHandrail":true}',
    icon: '/models/staircase.png',
    defaultColor: '#cbd5e1',
    description: 'Tiered frost-proof solid limestone outdoor porch steps with textured non-slip bullnose treads'
  },
  {
    id: 'staircaseOutdoorDeck',
    name: 'Outdoor Porch & Timber Deck Flight',
    category: 'Stairs & Structural',
    width: 110,
    depth: 200,
    height: 150,
    model: 'procedural:stairs:{"type":"outdoor_deck","stepsCount":8,"hasHandrail":true}',
    icon: '/models/staircase.png',
    defaultColor: '#92400e',
    description: 'Pressure-treated western red cedar deck staircase connecting elevated patio to outdoor backyard'
  },
  {
    id: 'staircaseOutdoorMetal',
    name: 'Exterior Industrial Metal Fire Escape',
    category: 'Stairs & Structural',
    width: 100,
    depth: 220,
    height: 250,
    model: 'procedural:stairs:{"type":"outdoor_metal","stepsCount":12,"hasHandrail":true}',
    icon: '/models/staircase.png',
    defaultColor: '#475569',
    description: 'Galvanized heavy steel exterior stairs with perforated non-skid drainage steps and safety handrails'
  },

  // ==========================================
  // GARDEN, TREES, BOTANICALS & LANDSCAPING
  // ==========================================
  {
    id: 'treeRoyalPalm',
    name: 'Tropical Royal Palm Tree',
    category: 'Garden & Outdoor',
    width: 140,
    depth: 140,
    height: 260,
    model: 'procedural:tree:{"type":"palm"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Statuesque tropical palm tree with ringed timber trunk and radiating graceful palm fronds'
  },
  {
    id: 'treeJapaneseMaple',
    name: 'Japanese Crimson Maple Tree',
    category: 'Garden & Outdoor',
    width: 150,
    depth: 150,
    height: 220,
    model: 'procedural:tree:{"type":"deciduous_tree","foliageStyle":"autumn_red"}',
    icon: '/models/plant.png',
    defaultColor: '#991b1b',
    description: 'Ornamental Japanese maple with spreading sculpted canopy of brilliant crimson-red autumn foliage'
  },
  {
    id: 'treeItalianCypress',
    name: 'Tuscan Columnar Cypress Tree',
    category: 'Garden & Outdoor',
    width: 70,
    depth: 70,
    height: 280,
    model: 'procedural:tree:{"type":"cypress","foliageStyle":"olive"}',
    icon: '/models/plant.png',
    defaultColor: '#4d6059',
    description: 'Slender architectural pencil cypress tree for perimeter villa borders and driveway avenues'
  },
  {
    id: 'treeLushShadeOak',
    name: 'Lush English Shade Oak Tree',
    category: 'Garden & Outdoor',
    width: 180,
    depth: 180,
    height: 250,
    model: 'procedural:tree:{"type":"deciduous_tree","foliageStyle":"lush_green"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Sprawling natural shade tree with organic branching trunk and lush green foliage clouds'
  },
  {
    id: 'gardenBoxwoodHedge',
    name: 'Boxwood Boundary Garden Hedge',
    category: 'Garden & Outdoor',
    width: 160,
    depth: 40,
    height: 100,
    model: 'procedural:garden:{"type":"hedge"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Crisply manicured evergreen boxwood hedge block for boundary borders and outdoor privacy'
  },
  {
    id: 'gardenSphericalTopiary',
    name: 'Urn Spherical Boxwood Topiary',
    category: 'Garden & Outdoor',
    width: 60,
    depth: 60,
    height: 120,
    model: 'procedural:garden:{"type":"topiary","potStyle":"ceramic_white"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Formal trimmed spherical boxwood topiary centered in a classical white ceramic garden urn'
  },
  {
    id: 'gardenHydrangeaBush',
    name: 'Blooming Purple Hydrangea Bush',
    category: 'Garden & Outdoor',
    width: 85,
    depth: 85,
    height: 80,
    model: 'procedural:garden:{"type":"flowering_bush","hasFlowers":true,"flowerColor":"#8b5cf6"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Lush rounded flowering shrub blanketed with vibrant violet-blue hydrangea flower blossoms'
  },
  {
    id: 'gardenRoseBush',
    name: 'English Crimson Rose Bush',
    category: 'Garden & Outdoor',
    width: 80,
    depth: 80,
    height: 75,
    model: 'procedural:garden:{"type":"flowering_bush","hasFlowers":true,"flowerColor":"#e11d48"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Fragrant garden rose shrub dotted with velvet crimson-red rose blossom clusters'
  },
  {
    id: 'gardenRaisedPlanterBed',
    name: 'Raised Timber Garden Planter Bed',
    category: 'Garden & Outdoor',
    width: 160,
    depth: 70,
    height: 50,
    model: 'procedural:garden:{"type":"planter_box"}',
    icon: '/models/squareTable.png',
    defaultColor: '#5c3d2e',
    description: 'Solid cedar timber raised garden trough filled with organic soil, green shrubs, and blooming flowers'
  },
  {
    id: 'gardenStoneFountain',
    name: 'Classic Two-Tier Stone Garden Fountain',
    category: 'Garden & Outdoor',
    width: 110,
    depth: 110,
    height: 130,
    model: 'procedural:garden:{"type":"fountain"}',
    icon: '/models/roundTable.png',
    defaultColor: '#e2e8f0',
    description: 'Two-tier carved sandstone architectural fountain with overflowing circular basins and center finial'
  },
  {
    id: 'gardenPatioBench',
    name: 'Teak Heritage Garden Patio Bench',
    category: 'Garden & Outdoor',
    width: 150,
    depth: 60,
    height: 85,
    model: 'procedural:chair:{"backrestStyle":"spindle_slats","seatType":"wood_plank","legStyle":"straight_4"}',
    icon: '/models/chair.png',
    defaultColor: '#78350f',
    description: 'Weather-resistant solid teak slatted park bench for courtyard patios and lawn verandas'
  },
  {
    id: 'pottedMonsteraDeliciosa',
    name: 'Luxury Potted Monstera Deliciosa',
    category: 'Decor & Plants',
    width: 65,
    depth: 65,
    height: 130,
    model: 'procedural:plant:{"type":"potted_monstera","potStyle":"terracotta"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Architectural Swiss cheese plant with broad glossy leaves in a terracotta pot on tripod timber stand'
  },
  {
    id: 'pottedFiddleLeafFig',
    name: 'Indoor Architectural Fiddle Leaf Fig',
    category: 'Decor & Plants',
    width: 55,
    depth: 55,
    height: 165,
    model: 'procedural:plant:{"type":"potted_fig","potStyle":"ceramic_white"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Tall sculptural indoor tree with violin-shaped emerald leaves in a white glazed ceramic planter'
  },
  {
    id: 'pottedSnakePlant',
    name: 'Architectural Snake Plant & Metal Stand',
    category: 'Decor & Plants',
    width: 40,
    depth: 40,
    height: 95,
    model: 'procedural:plant:{"type":"potted_snake","potStyle":"charcoal_concrete"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
  },
  {
    id: 'treeWeepingWillow',
    name: 'Graceful Weeping Willow Tree',
    category: 'Garden & Outdoor',
    width: 220,
    depth: 220,
    height: 260,
    model: 'procedural:tree:{"type":"weeping_willow"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Picturesque weeping willow tree with gnarled trunk and cascading weeping foliage tendrils'
  },
  {
    id: 'gardenZenBambooGrove',
    name: 'Zen Bamboo Grove in Stone Planter',
    category: 'Garden & Outdoor',
    width: 140,
    depth: 55,
    height: 220,
    model: 'procedural:garden:{"type":"bamboo"}',
    icon: '/models/plant.png',
    defaultColor: '#4d7c0f',
    description: 'Architectural cluster of segmented golden bamboo canes with delicate leaf sprays in a charcoal planter'
  },
  {
    id: 'decorJapaneseJuniperBonsai',
    name: 'Artisanal Japanese Juniper Bonsai Tray',
    category: 'Decor & Plants',
    width: 45,
    depth: 35,
    height: 42,
    model: 'procedural:plant:{"type":"bonsai","potStyle":"ceramic_white"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Sculpted S-curved miniature juniper bonsai with horizontal cloud foliage pads in a glazed oval ceramic tray'
  },
  {
    id: 'gardenDesertSaguaroCactus',
    name: 'Architectural Desert Saguaro Cactus',
    category: 'Garden & Outdoor',
    width: 65,
    depth: 50,
    height: 160,
    model: 'procedural:garden:{"type":"cactus","potStyle":"terracotta"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Iconic desert Saguaro cactus with vertical ribbed fluting and upward-curving arms in a terracotta pot'
  },
  {
    id: 'treeTropicalBananaPalm',
    name: 'Tropical Wide-Leaf Banana Palm Tree',
    category: 'Garden & Outdoor',
    width: 170,
    depth: 170,
    height: 230,
    model: 'procedural:tree:{"type":"banana_palm"}',
    icon: '/models/plant.png',
    defaultColor: '#15803d',
    description: 'Exotic tropical banana tree with massive arching paddle leaves and textured pseudostem trunk'
  },
  {
    id: 'gardenCedarTimberPergola',
    name: 'Cedar Garden Arbor Pergola Gazebo',
    category: 'Garden & Outdoor',
    width: 280,
    depth: 240,
    height: 245,
    model: 'procedural:garden:{"type":"pergola"}',
    icon: '/models/squareTable.png',
    defaultColor: '#78350f',
    description: 'Solid cedar timber garden pergola trellis with 4 sturdy posts, dappled shade cross rafters, and climbing ivy vines'
  },
  {
    id: 'gardenStoneFirePit',
    name: 'Circular Natural Stone Fire Pit & Embers',
    category: 'Garden & Outdoor',
    width: 110,
    depth: 110,
    height: 42,
    model: 'procedural:garden:{"type":"fire_pit"}',
    icon: '/models/roundTable.png',
    defaultColor: '#475569',
    description: 'Circular carved flagstone masonry outdoor fire pit with charcoal lava bed, glowing fiery amber embers, and warm flame'
  },

  // ==========================================
  // 15. VEHICLES & GARAGE
  // ==========================================
  {
    id: 'vehicleExecutiveSedan',
    name: 'Executive 4-Door Luxury Sedan',
    category: 'Vehicles',
    width: 185,
    depth: 480,
    height: 145,
    model: 'procedural:vehicle:{"type":"sedan"}',
    icon: '/models/sofa.png',
    defaultColor: '#1e293b',
    description: 'Sleek executive 4-door saloon sedan with aerodynamic bodywork, alloy rims, tinted glass, and LED light package'
  },
  {
    id: 'vehicleLuxurySUV',
    name: 'Full-Size Luxury All-Wheel-Drive SUV',
    category: 'Vehicles',
    width: 200,
    depth: 500,
    height: 178,
    model: 'procedural:vehicle:{"type":"suv"}',
    icon: '/models/sofa.png',
    defaultColor: '#0f172a',
    description: 'Full-size prestige family SUV with elevated ground clearance, roof rack rails, dual exhaust tips, and all-weather alloy wheels'
  },
  {
    id: 'vehicleSuperSportCoupe',
    name: 'Grand Tourer Sports Coupe & Spoiler',
    category: 'Vehicles',
    width: 195,
    depth: 460,
    height: 125,
    model: 'procedural:vehicle:{"type":"sports"}',
    icon: '/models/sofa.png',
    defaultColor: '#dc2626',
    description: 'High-performance low-slung aerodynamic sports coupe featuring an aggressive aerodynamic rear wing spoiler and low-profile sports rims'
  },
  {
    id: 'vehicleElectricEV',
    name: 'Next-Gen Electric EV Aerodynamic Sedan',
    category: 'Vehicles',
    width: 190,
    depth: 475,
    height: 142,
    model: 'procedural:vehicle:{"type":"ev"}',
    icon: '/models/sofa.png',
    defaultColor: '#f8fafc',
    description: 'Ultra-modern zero-emission electric vehicle with smooth aero front fascia, full-width continuous LED cyber lightbar, and panoramic glass roof'
  },
  {
    id: 'vehicleDualCabTruck',
    name: 'All-Terrain Dual-Cab Pickup Truck',
    category: 'Vehicles',
    width: 205,
    depth: 535,
    height: 182,
    model: 'procedural:vehicle:{"type":"truck"}',
    icon: '/models/sofa.png',
    defaultColor: '#334155',
    description: 'Rugged dual-cab pickup truck with spacious 5-passenger cabin, reinforced open cargo truck bed, sturdy tailgate, and high off-road suspension'
  },
  {
    id: 'vehicleClassicVespa',
    name: 'Italian Retro Urban Scooter / Vespa',
    category: 'Vehicles',
    width: 70,
    depth: 175,
    height: 115,
    model: 'procedural:vehicle:{"type":"vespa"}',
    icon: '/models/chair.png',
    defaultColor: '#0284c7',
    description: 'Classic Italian retro urban scooter featuring curved vintage leg apron shield, chrome round headlight, bulbous engine cowlings, and dual saddle'
  },
  {
    id: 'vehicleCityCommuterBike',
    name: 'Urban City Commuter Diamond Bicycle',
    category: 'Vehicles',
    width: 55,
    depth: 175,
    height: 105,
    model: 'procedural:vehicle:{"type":"bicycle"}',
    icon: '/models/chair.png',
    defaultColor: '#10b981',
    description: 'Lightweight urban commuter bicycle with diamond frame geometry, spoked wheels, ergonomic handlebars, and road saddle'
  }
];

export async function fetchCatalog(): Promise<CatalogItem[]> {
  let customItems: CatalogItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('decofrog_custom_catalog') || localStorage.getItem('sweethome_custom_catalog');
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
      const cached = localStorage.getItem('decofrog_custom_catalog') || localStorage.getItem('sweethome_custom_catalog');
      const list: CatalogItem[] = cached ? JSON.parse(cached) : [];
      const updated = [customItem, ...list.filter((i) => i.id !== customItem.id)];
      localStorage.setItem('decofrog_custom_catalog', JSON.stringify(updated));
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

export async function updateCatalogItem(item: CatalogItem): Promise<CatalogItem> {
  const updatedItem = { ...item };
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('decofrog_custom_catalog') || localStorage.getItem('sweethome_custom_catalog');
      const list: CatalogItem[] = cached ? JSON.parse(cached) : [];
      const updated = list.map((i) => (i.id === item.id ? updatedItem : i));
      if (!list.some((i) => i.id === item.id)) {
        updated.unshift(updatedItem);
      }
      localStorage.setItem('decofrog_custom_catalog', JSON.stringify(updated));
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/catalog/furniture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not update item on backend, saved locally.', err);
  }
  return updatedItem;
}

export async function deleteCatalogItem(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('decofrog_custom_catalog') || localStorage.getItem('sweethome_custom_catalog');
      if (cached) {
        const list: CatalogItem[] = JSON.parse(cached);
        const updated = list.filter((i) => i.id !== id);
        localStorage.setItem('decofrog_custom_catalog', JSON.stringify(updated));
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
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.warn('Backend users API error:', err);
  }
  return [];
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
      localStorage.setItem(`decofrog_plan_${cleanId}`, JSON.stringify(copy));
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
      localStorage.setItem(`decofrog_plan_${cleanId}`, JSON.stringify(copy));
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
      localStorage.setItem(`decofrog_plan_${cleanId}`, JSON.stringify(copy));
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
    localStorage.setItem(`decofrog_plan_${cleanId}`, JSON.stringify(freshPlan));
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
    const res = await fetch('/api/templates', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Templates /api/templates offline, trying legacy fallback...', err);
  }

  try {
    const res = await fetch(`${API_BASE}/plan/templates`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Templates API offline, using defaults.', err);
  }
  return [
    { id: 'starter-sarah-suite', name: 'Modern 2-Bedroom Suite', description: 'Spacious open living room with master suite.', floors: 2, area: '59 m²' },
    { id: 'starter-david-villa', name: 'Luxury Multi-Story Villa', description: 'Grand foyer with private suites and jacuzzi.', floors: 2, area: '90 m²' },
    { id: 'starter-emma-studio', name: 'Urban Studio Loft', description: 'Minimalist open-plan studio layout.', floors: 1, area: '20 m²' },
  ];
}

export async function fetchPlanById(planId: string): Promise<HomePlan> {
  // 1. Check local storage cache
  if (typeof window !== 'undefined') {
    const cached =
      localStorage.getItem(`decofrog_plan_${planId}`) ||
      localStorage.getItem(`sweethome_plan_${planId}`);
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

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    try {
      const token =
        localStorage.getItem('decofrog_sub_token') ||
        localStorage.getItem('sweethome_sub_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const userStr =
        localStorage.getItem('decofrog_current_user') ||
        localStorage.getItem('sweethome_current_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.id) headers['x-user-id'] = u.id;
        if (u.email) headers['x-user-email'] = u.email;
        if (u.role) headers['x-user-role'] = u.role;
      }
    } catch {}
  }
  return headers;
}

export async function savePlanToBackend(
  plan: HomePlan,
  authorName: string = 'User',
  changeDesc: string = 'Auto-saved plan state'
): Promise<{ success: boolean; id: string; version?: number; message?: string }> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`decofrog_plan_${plan.id}`, JSON.stringify(plan));
  }
  try {
    const url = new URL(`${API_BASE}/plan/save`);
    url.searchParams.set('author', authorName);
    url.searchParams.set('description', changeDesc);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: getAuthHeaders(),
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

