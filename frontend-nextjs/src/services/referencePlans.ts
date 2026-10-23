import { HomePlan, Wall, Room, FurnitureItem, DimensionLine, TextNote } from '../types/plan';

// ============================================================================
// 100% FAITHFUL MATCH TO USER REFERENCE IMAGES 1 & 2
// Image 1: 30'-0" x 42'-0" Architectural Blueprint Layout (2 BHK + Veranda + Parking)
// Image 2: Ultra-Realistic 3D Calacatta Marble Cutaway Architectural Visualization
// ============================================================================
export const referenceLuxuryPlan: HomePlan = {
  id: 'plan_reference_30x42_luxury',
  name: '30\' × 42\' Luxury Residence (Reference 1 & 2)',
  version: '2.0',
  createdAt: '2026-10-17T16:00:00Z',
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 280 },
    { level: 1, name: 'First Floor', elevation: 280, height: 280 },
  ],
  walls: [
    // ------------------------------------------------------------------------
    // EXTERIOR PERIMETER WALLS (20cm thick, 280cm high)
    // ------------------------------------------------------------------------
    // Rear Wall (North): 30'-0" (915cm) from X = -460 to +455 at Y = -640
    { id: 'rw_north', xStart: -460, yStart: -640, xEnd: 455, yEnd: -640, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    // West Exterior Wall (Left): 42'-0" (1280cm) from Y = -640 to +640 at X = -460
    { id: 'rw_west', xStart: -460, yStart: -640, xEnd: -460, yEnd: 640, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    // East Exterior Wall (Right of Main House): from Y = -640 to +360 at X = +455
    { id: 'rw_east_main', xStart: 455, yStart: -640, xEnd: 455, yEnd: 360, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    // South Wall of Kitchen (Front Left): from X = -460 to -95 at Y = +640
    { id: 'rw_south_kitchen', xStart: -460, yStart: 640, xEnd: -95, yEnd: 640, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    // Wall separating Kitchen and Veranda: from Y = +640 to +360 at X = -95
    { id: 'rw_div_kitchen_veranda', xStart: -95, yStart: 640, xEnd: -95, yEnd: 360, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },
    // South Wall of Veranda (Front Entry Edge): from X = -95 to +455 at Y = +520
    { id: 'rw_south_veranda', xStart: -95, yStart: 520, xEnd: 455, yEnd: 520, thickness: 15, height: 110, color: '#f8fafc', floorLevel: 0 },
    // East Wall of Veranda: from Y = +360 to +520 at X = +455
    { id: 'rw_east_veranda', xStart: 455, yStart: 360, xEnd: 455, yEnd: 520, thickness: 15, height: 110, color: '#f8fafc', floorLevel: 0 },

    // Parking Boundary Wall (Far Right): along driveway from Y = -640 to +640 at X = +740
    { id: 'rw_parking_bound', xStart: 740, yStart: -640, xEnd: 740, yEnd: 640, thickness: 15, height: 200, color: '#e2e8f0', floorLevel: 0 },
    { id: 'rw_parking_back', xStart: 455, yStart: -640, xEnd: 740, yEnd: -640, thickness: 15, height: 200, color: '#e2e8f0', floorLevel: 0 },

    // ------------------------------------------------------------------------
    // INTERIOR PARTITION WALLS (15cm thick, 280cm high)
    // ------------------------------------------------------------------------
    // Main Wall between Living and Veranda (Front Entrance): from X = -95 to +455 at Y = +360
    { id: 'iw_living_veranda', xStart: -95, yStart: 360, xEnd: 455, yEnd: 360, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Spine Wall separating Living & Dining: from Y = -155 to +360 at X = -95
    { id: 'iw_spine_living_dining', xStart: -95, yStart: -155, xEnd: -95, yEnd: 360, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Horizontal Wall separating Rear Bedrooms & Middle Zone: from X = -460 to +455 at Y = -275
    { id: 'iw_rear_bedrooms_div', xStart: -460, yStart: -275, xEnd: 455, yEnd: -275, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Bedroom 1 and Attached Toilet / Dressing: from Y = -640 to -275 at X = -95
    { id: 'iw_bed1_att_div', xStart: -95, yStart: -640, xEnd: -95, yEnd: -275, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Attached Toilet / Dressing and Bedroom 2: from Y = -640 to -275 at X = 35
    { id: 'iw_att_bed2_div', xStart: 35, yStart: -640, xEnd: 35, yEnd: -275, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Attached Toilet (Top) and Dressing Room (Bottom): from X = -95 to +35 at Y = -425
    { id: 'iw_toilet_dressing_div', xStart: -95, yStart: -425, xEnd: 35, yEnd: -425, thickness: 12, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall enclosing Common Toilet: from X = 155 to +455 at Y = -155
    { id: 'iw_comm_toilet_btm', xStart: 155, yStart: -155, xEnd: 455, yEnd: -155, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'iw_comm_toilet_left', xStart: 155, yStart: -275, xEnd: 155, yEnd: -155, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Staircase and Dining Room: from X = -460 to -95 at Y = -75
    { id: 'iw_stair_dining_div', xStart: -460, yStart: -75, xEnd: -95, yEnd: -75, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Dining Room and Store Room: from X = -460 to -95 at Y = +170
    { id: 'iw_dining_store_div', xStart: -460, yStart: 170, xEnd: -95, yEnd: 170, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Wall separating Store Room and Kitchen: from X = -460 to -95 at Y = +290
    { id: 'iw_store_kitchen_div', xStart: -460, yStart: 290, xEnd: -95, yEnd: 290, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // Store Room Right Partition: from Y = +170 to +290 at X = -215
    { id: 'iw_store_right', xStart: -215, yStart: 170, xEnd: -215, yEnd: 290, thickness: 12, height: 280, color: '#f8fafc', floorLevel: 0 },
  ],
  rooms: [
    // 1. VARANDHA (15'0" x 5'0" - Veranda Porch)
    {
      id: 'rm_varandha',
      name: 'Varandha (15\'0" × 5\'0")',
      floorLevel: 0,
      points: [{ x: -95, y: 360 }, { x: 455, y: 360 }, { x: 455, y: 520 }, { x: -95, y: 520 }],
      floorColor: '#f1f5f9', // Stone Porch Tile
      areaSquareMeters: 8.8,
    },
    // 2. LIVING HALL (15'0" x 16'5" - Grand Living)
    {
      id: 'rm_living',
      name: 'Living (15\'0" × 16\'5")',
      floorLevel: 0,
      points: [{ x: -95, y: -155 }, { x: 455, y: -155 }, { x: 455, y: 360 }, { x: -95, y: 360 }],
      floorColor: '#faf8f5', // Polished Calacatta Gold Marble Slab (Image 2 Match)
      areaSquareMeters: 28.3,
    },
    // 3. DINING AREA (12'0" x 8'0")
    {
      id: 'rm_dining',
      name: 'Dining (12\'0" × 8\'0")',
      floorLevel: 0,
      points: [{ x: -460, y: -75 }, { x: -95, y: -75 }, { x: -95, y: 170 }, { x: -460, y: 170 }],
      floorColor: '#faf8f5', // Calacatta Marble continuation
      areaSquareMeters: 8.9,
    },
    // 4. MODULAR KITCHEN (12'0" x 9'0")
    {
      id: 'rm_kitchen',
      name: 'Kitchen (12\'0" × 9\'0")',
      floorLevel: 0,
      points: [{ x: -460, y: 290 }, { x: -95, y: 290 }, { x: -95, y: 640 }, { x: -460, y: 640 }],
      floorColor: '#faf8f5', // Calacatta Marble
      areaSquareMeters: 12.8,
    },
    // 5. STORE / PANTRY (8'0" x 4'0")
    {
      id: 'rm_store',
      name: 'Store (8\'0" × 4\'0")',
      floorLevel: 0,
      points: [{ x: -460, y: 170 }, { x: -215, y: 170 }, { x: -215, y: 290 }, { x: -460, y: 290 }],
      floorColor: '#f1f5f9',
      areaSquareMeters: 2.9,
    },
    // 6. EXECUTIVE HOME OFFICE / STUDY (12'0" x 6'6" - Realistic Usable Space)
    {
      id: 'rm_study',
      name: 'Study & Home Office (12\'0" × 6\'6")',
      floorLevel: 0,
      points: [{ x: -460, y: -275 }, { x: -95, y: -275 }, { x: -95, y: -75 }, { x: -460, y: -75 }],
      floorColor: '#faf8f5',
      areaSquareMeters: 7.3,
    },
    // 7. BEDROOM 1 - PRIMARY MASTER (12'0" x 12'0")
    {
      id: 'rm_bed1',
      name: 'Bedroom 1 (12\'0" × 12\'0")',
      floorLevel: 0,
      points: [{ x: -460, y: -640 }, { x: -95, y: -640 }, { x: -95, y: -275 }, { x: -460, y: -275 }],
      floorColor: '#faf8f5', // Marble with Bedside Accent Rug
      areaSquareMeters: 13.3,
    },
    // 8. DRESSING AREA (4'3" x 4'6")
    {
      id: 'rm_dressing',
      name: 'Dressing (4\'3" × 4\'6")',
      floorLevel: 0,
      points: [{ x: -95, y: -425 }, { x: 35, y: -425 }, { x: 35, y: -275 }, { x: -95, y: -275 }],
      floorColor: '#faf8f5',
      areaSquareMeters: 1.9,
    },
    // 9. ATTACHED TOILET - A.TOILET (4'3" x 7'0")
    {
      id: 'rm_att_toilet',
      name: 'A.Toilet (4\'3" × 7\'0")',
      floorLevel: 0,
      points: [{ x: -95, y: -640 }, { x: 35, y: -640 }, { x: 35, y: -425 }, { x: -95, y: -425 }],
      floorColor: '#e0f2fe', // Spa Porcelain Blue-White Tile
      areaSquareMeters: 2.8,
    },
    // 10. BEDROOM 2 - GUEST SUITE (11'6" x 12'0")
    {
      id: 'rm_bed2',
      name: 'Bedroom 2 (11\'6" × 12\'0")',
      floorLevel: 0,
      points: [{ x: 35, y: -640 }, { x: 455, y: -640 }, { x: 455, y: -275 }, { x: 35, y: -275 }],
      floorColor: '#faf8f5',
      areaSquareMeters: 15.3,
    },
    // 11. COMMON TOILET - C.TOILET (7'6" x 4'0")
    {
      id: 'rm_comm_toilet',
      name: 'C.Toilet (7\'6" × 4\'0")',
      floorLevel: 0,
      points: [{ x: 155, y: -275 }, { x: 455, y: -275 }, { x: 455, y: -155 }, { x: 155, y: -155 }],
      floorColor: '#e0f2fe',
      areaSquareMeters: 3.6,
    },
    // 12. PARKING & DRIVEWAY (10'0" x 42'0")
    {
      id: 'rm_parking',
      name: 'Parking Driveway (10\'0" × 42\'0")',
      floorLevel: 0,
      points: [{ x: 455, y: -640 }, { x: 740, y: -640 }, { x: 740, y: 640 }, { x: 455, y: 640 }],
      floorColor: '#cbd5e1', // Paver Driveway Stone
      areaSquareMeters: 36.5,
    },
  ],
  furniture: [
    // ========================================================================
    // 1. CAR PARKING & LANDSCAPING (Exact Match to Image 1)
    // ========================================================================
    // White Luxury Sedan Automobile
    {
      id: 'fn_car_sedan',
      catalogId: 'car',
      name: 'Executive White Sedan Car',
      category: 'Outdoor & Garden',
      x: 600,
      y: 340,
      elevation: 0,
      angle: 0,
      width: 185,
      depth: 460,
      height: 145,
      model: 'procedural:car:{"type":"sedan"}',
      icon: '/models/car.png',
      color: '#f8fafc',
      floorLevel: 0,
      description: 'Full-size white luxury sedan parked in the covered carport driveway'
    },
    // Landscaping Perimeter Palms along boundary wall
    { id: 'fn_tree_1', catalogId: 'treeRoyalPalm', name: 'Boundary Palm Tree 1', category: 'Garden & Outdoor', x: 670, y: -520, elevation: 0, angle: 0, width: 90, depth: 90, height: 230, model: 'procedural:tree:{"type":"palm"}', color: '#15803d', floorLevel: 0 },
    { id: 'fn_tree_2', catalogId: 'treeRoyalPalm', name: 'Boundary Palm Tree 2', category: 'Garden & Outdoor', x: 670, y: -340, elevation: 0, angle: 0, width: 90, depth: 90, height: 215, model: 'procedural:tree:{"type":"palm"}', color: '#15803d', floorLevel: 0 },
    { id: 'fn_tree_3', catalogId: 'treeRoyalPalm', name: 'Boundary Palm Tree 3', category: 'Garden & Outdoor', x: 670, y: -160, elevation: 0, angle: 0, width: 90, depth: 90, height: 230, model: 'procedural:tree:{"type":"palm"}', color: '#15803d', floorLevel: 0 },
    { id: 'fn_tree_4', catalogId: 'treeRoyalPalm', name: 'Boundary Palm Tree 4', category: 'Garden & Outdoor', x: 670, y: 20, elevation: 0, angle: 0, width: 85, depth: 85, height: 195, model: 'procedural:tree:{"type":"palm"}', color: '#15803d', floorLevel: 0 },

    // ========================================================================
    // 2. VARANDHA (VERANDA PORCH - Image 1 Match)
    // ========================================================================
    {
      id: 'fn_v_chair_1',
      catalogId: 'chair',
      name: 'Veranda Rattan Armchair Left',
      category: 'Living',
      x: 140,
      y: 440,
      elevation: 0,
      angle: 0,
      width: 60,
      depth: 60,
      height: 80,
      model: '/models/chair.obj',
      color: '#334155',
      floorLevel: 0
    },
    {
      id: 'fn_v_chair_2',
      catalogId: 'chair',
      name: 'Veranda Rattan Armchair Right',
      category: 'Living',
      x: 230,
      y: 440,
      elevation: 0,
      angle: 0,
      width: 60,
      depth: 60,
      height: 80,
      model: '/models/chair.obj',
      color: '#334155',
      floorLevel: 0
    },
    // Front Entrance Door (swinging into Living Hall)
    {
      id: 'fn_front_door',
      catalogId: 'door',
      name: 'Solid Teak Main Entrance Door',
      category: 'Doors & Windows',
      x: 20,
      y: 360,
      elevation: 0,
      angle: 0,
      width: 105,
      depth: 18,
      height: 220,
      model: '/models/door.obj',
      icon: '/models/door.png',
      color: '#5c3d2e',
      floorLevel: 0
    },

    // ========================================================================
    // 3. LIVING HALL (Image 1 Blueprint + Image 2 Aesthetic Match)
    // ========================================================================
    // Cream Boucle L-Shaped Sectional Sofa (Matching Image 1 & 2)
    {
      id: 'fn_l_sofa_main',
      catalogId: 'sofa',
      name: 'Cream Bouclé L-Sectional Sofa',
      category: 'Living',
      x: 380,
      y: 110,
      elevation: 0,
      angle: -Math.PI / 2,
      width: 310,
      depth: 95,
      height: 85,
      model: '/models/sofa.obj',
      color: '#f5f5f0', // Cream bouclé matching Image 2
      floorLevel: 0
    },
    {
      id: 'fn_l_sofa_return',
      catalogId: 'sofa',
      name: 'Sectional Corner Return Chaise',
      category: 'Living',
      x: 235,
      y: -95,
      elevation: 0,
      angle: Math.PI,
      width: 190,
      depth: 95,
      height: 85,
      model: '/models/sofa.obj',
      color: '#f5f5f0',
      floorLevel: 0
    },
    // Rectangular Calacatta Marble Coffee Table (Image 2 Match)
    {
      id: 'fn_living_table',
      catalogId: 'squareTable',
      name: 'Calacatta Marble Center Coffee Table',
      category: 'Living',
      x: 200,
      y: 110,
      elevation: 0,
      angle: 0,
      width: 120,
      depth: 65,
      height: 44,
      model: '/models/squareTable.obj',
      color: '#faf8f5',
      floorLevel: 0
    },
    // Living Room Media Partition TV Unit (facing sofa on west wall)
    {
      id: 'fn_living_tv_unit',
      catalogId: 'sideboardBuffet',
      name: 'Wall-Mounted Media Credenza & TV',
      category: 'Living',
      x: -80,
      y: 110,
      elevation: 0,
      angle: Math.PI / 2,
      width: 180,
      depth: 42,
      height: 55,
      model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"solid_doors","hasLegs":true}',
      color: '#1e293b',
      floorLevel: 0
    },
    // Potted Living Palms
    { id: 'fn_l_plant_1', catalogId: 'plant', name: 'Living Corner Palm', category: 'Decor & Plants', x: 400, y: 310, elevation: 0, angle: 0, width: 50, depth: 50, height: 130, model: '/models/plant.obj', color: '#15803d', floorLevel: 0 },
    { id: 'fn_l_plant_2', catalogId: 'plant', name: 'Living North Palm', category: 'Decor & Plants', x: 400, y: -110, elevation: 0, angle: 0, width: 50, depth: 50, height: 130, model: '/models/plant.obj', color: '#15803d', floorLevel: 0 },

    // ========================================================================
    // 4. DINING AREA (Image 1 & Image 2 Match)
    // ========================================================================
    // 6-Seater Formal Dining Table
    {
      id: 'fn_dining_table',
      catalogId: 'squareTable',
      name: 'Formal 6-Seater Solid Timber Dining Table',
      category: 'Living',
      x: -280,
      y: 50,
      elevation: 0,
      angle: 0,
      width: 170,
      depth: 95,
      height: 76,
      model: '/models/squareTable.obj',
      color: '#5c3d2e',
      floorLevel: 0
    },
    // 6 Dining Chairs
    { id: 'fn_dc_1', catalogId: 'chair', name: 'Dining Chair N1', category: 'Living', x: -340, y: -15, elevation: 0, angle: 0, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    { id: 'fn_dc_2', catalogId: 'chair', name: 'Dining Chair N2', category: 'Living', x: -280, y: -15, elevation: 0, angle: 0, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    { id: 'fn_dc_3', catalogId: 'chair', name: 'Dining Chair N3', category: 'Living', x: -220, y: -15, elevation: 0, angle: 0, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    { id: 'fn_dc_4', catalogId: 'chair', name: 'Dining Chair S1', category: 'Living', x: -340, y: 115, elevation: 0, angle: Math.PI, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    { id: 'fn_dc_5', catalogId: 'chair', name: 'Dining Chair S2', category: 'Living', x: -280, y: 115, elevation: 0, angle: Math.PI, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    { id: 'fn_dc_6', catalogId: 'chair', name: 'Dining Chair S3', category: 'Living', x: -220, y: 115, elevation: 0, angle: Math.PI, width: 46, depth: 46, height: 90, model: '/models/chair.obj', color: '#475569', floorLevel: 0 },
    // Modern Dining Ring Chandelier (Image 2 Match)
    {
      id: 'fn_dining_light',
      catalogId: 'pendantLamp',
      name: 'Sculptural Brass Ring Chandelier',
      category: 'Lighting',
      x: -280,
      y: 50,
      elevation: 190,
      angle: 0,
      width: 65,
      depth: 65,
      height: 75,
      model: '/models/pendantLamp.obj',
      color: '#d4af37',
      floorLevel: 0
    },

    // ========================================================================
    // 5. MODULAR KITCHEN & STORE (Image 1 & Image 2 Two-Tone Arched Match)
    // ========================================================================
    // L-Shaped Arched Base Cabinet along South Wall
    {
      id: 'fn_k_base_south',
      catalogId: 'kitchenArchedBase',
      name: 'Bespoke Arched Inset Base Cabinet Unit',
      category: 'Kitchen',
      x: -260,
      y: 605,
      elevation: 0,
      angle: Math.PI,
      width: 150,
      depth: 62,
      height: 88,
      model: 'procedural:cabinet:{"columns":3,"rows":1,"doorType":"arched_panel","hasLegs":false,"countertop":true}',
      color: '#4d6059', // Stonybrook Green
      floorLevel: 0
    },
    // Arched Reeded Glass Wall Cabinet
    {
      id: 'fn_k_wall_south',
      catalogId: 'kitchenArchedGlassWall',
      name: 'Parisian Arched Reeded Glass Wall Cabinet',
      category: 'Kitchen',
      x: -260,
      y: 615,
      elevation: 140,
      angle: Math.PI,
      width: 140,
      depth: 36,
      height: 85,
      model: 'procedural:cabinet:{"columns":3,"rows":2,"doorType":"arched_glass","hasLegs":false,"hasCrown":true,"underLighting":true}',
      color: '#4d6059',
      floorLevel: 0
    },
    // 4-Burner Gas Cooktop / Hob on South Counter
    {
      id: 'fn_k_cooker',
      catalogId: 'cooker',
      name: 'Ceramic Induction Cooktop & Convection Oven',
      category: 'Kitchen',
      x: -360,
      y: 605,
      elevation: 0,
      angle: Math.PI,
      width: 75,
      depth: 65,
      height: 85,
      model: '/models/cooker.obj',
      color: '#0f172a',
      floorLevel: 0
    },
    // L-Shaped West Counter with Double Bowl Sink
    {
      id: 'fn_k_sink',
      catalogId: 'kitchenSink',
      name: 'Double Bowl Stainless Kitchen Sink',
      category: 'Kitchen',
      x: -425,
      y: 420,
      elevation: 0,
      angle: Math.PI / 2,
      width: 90,
      depth: 60,
      height: 85,
      model: '/models/sink.obj',
      color: '#e2e8f0',
      floorLevel: 0
    },
    // French Door Stainless Double Refrigerator (REF. in bottom-right corner of kitchen)
    {
      id: 'fn_k_fridge',
      catalogId: 'refrigerator',
      name: 'Double-Door Stainless Refrigerator (REF.)',
      category: 'Kitchen',
      x: -140,
      y: 590,
      elevation: 0,
      angle: Math.PI,
      width: 90,
      depth: 75,
      height: 185,
      model: '/models/fridge.obj',
      color: '#cbd5e1',
      floorLevel: 0
    },
    // Store Room Pantry Rack Shelving
    {
      id: 'fn_store_rack',
      catalogId: 'bookcase',
      name: 'Built-in Pantry Larder Shelving Rack',
      category: 'Storage',
      x: -425,
      y: 230,
      elevation: 0,
      angle: Math.PI / 2,
      width: 100,
      depth: 40,
      height: 200,
      model: '/models/bookcase.obj',
      color: '#5c3d2e',
      floorLevel: 0
    },

    // ========================================================================
    // 6. EXECUTIVE HOME OFFICE / STUDY (12'0" x 6'6" - Realistic Usable Living Space)
    // ========================================================================
    // Solid Oak Executive Work Desk
    {
      id: 'fn_study_desk',
      catalogId: 'squareTable',
      name: 'Executive Oak Work-From-Home Desk',
      category: 'Bedroom',
      x: -280,
      y: -175,
      elevation: 0,
      angle: 0,
      width: 140,
      depth: 70,
      height: 75,
      model: 'procedural:desk:{}',
      icon: '/models/squareTable.png',
      color: '#5c3d2e',
      floorLevel: 0,
      description: 'Solid executive timber desk positioned in front of natural daylight window'
    },
    // Ergonomic Swivel Task Office Chair
    {
      id: 'fn_study_chair',
      catalogId: 'chair',
      name: 'Ergonomic Leather Executive Swivel Chair',
      category: 'Bedroom',
      x: -280,
      y: -125,
      elevation: 0,
      angle: 0,
      width: 58,
      depth: 58,
      height: 95,
      model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"cushioned","legStyle":"swivel_pedestal"}',
      icon: '/models/chair.png',
      color: '#1e293b',
      floorLevel: 0
    },
    // Built-in Architectural Bookshelf & Library Unit (North Wall)
    {
      id: 'fn_study_bookcase',
      catalogId: 'bookcase',
      name: 'Full-Height Built-In Library & Display Shelving',
      category: 'Storage',
      x: -360,
      y: -255,
      elevation: 0,
      angle: 0,
      width: 160,
      depth: 38,
      height: 220,
      model: '/models/bookcase.obj',
      icon: '/models/bookcase.png',
      color: '#334155',
      floorLevel: 0
    },
    // Designer Gooseneck Reading Lamp
    {
      id: 'fn_study_lamp',
      catalogId: 'tableLamp',
      name: 'Brushed Brass Task Reading Lamp',
      category: 'Lighting',
      x: -320,
      y: -185,
      elevation: 75,
      angle: 0,
      width: 25,
      depth: 25,
      height: 42,
      model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":22,"shadeHeight":18,"totalHeight":42}',
      icon: '/models/pendantLamp.png',
      color: '#d4af37',
      floorLevel: 0,
      placementType: 'tabletop',
      placeOnTable: true
    },
    // Potted Corner Fiddle Leaf Fig Plant
    {
      id: 'fn_study_plant',
      catalogId: 'plant',
      name: 'Potted Fiddle Leaf Fig',
      category: 'Decor & Plants',
      x: -140,
      y: -240,
      elevation: 0,
      angle: 0,
      width: 45,
      depth: 45,
      height: 120,
      model: '/models/plant.obj',
      icon: '/models/plant.png',
      color: '#166534',
      floorLevel: 0
    },

    // ========================================================================
    // 7. BEDROOM 1 - MASTER SUITE (Image 1 Blueprint + Image 2 3D Match)
    // ========================================================================
    // Emerald / Teal Velvet Tufted King Bed (Image 2 Match)
    {
      id: 'fn_bed1_king',
      catalogId: 'bed140x190',
      name: 'Emerald Tufted Velvet King Bed',
      category: 'Bedroom',
      x: -280,
      y: -510,
      elevation: 0,
      angle: 0,
      width: 190,
      depth: 210,
      height: 115,
      model: '/models/bed140x190.obj',
      color: '#065f46', // Emerald / Teal velvet matching Image 2
      floorLevel: 0
    },
    // Vertical Fluted Timber Slat Feature Headboard Wall (Image 2 Match)
    {
      id: 'fn_bed1_slat_wall',
      catalogId: 'sideboardBuffet',
      name: 'Vertical Fluted Timber Acoustic Slat Wall',
      category: 'Wall Designs',
      x: -280,
      y: -625,
      elevation: 0,
      angle: 0,
      width: 330,
      depth: 10,
      height: 270,
      model: 'procedural:cabinet:{"columns":4,"rows":1,"doorType":"solid_doors","hasLegs":false}',
      color: '#c29f79', // Warm Scandinavian fluted oak
      floorLevel: 0
    },
    // Dual Bedside Nightstands & Designer Brass Reading Lamps
    { id: 'fn_b1_night_left', catalogId: 'bedsideTable', name: 'Master Bedside Table Left', category: 'Bedroom', x: -410, y: -570, elevation: 0, angle: 0, width: 50, depth: 45, height: 55, model: '/models/bedsideTable.obj', color: '#5c3d2e', floorLevel: 0 },
    { id: 'fn_b1_lamp_left', catalogId: 'workLamp', name: 'Brass Orb Table Lamp Left', category: 'Lighting', x: -410, y: -570, elevation: 55, angle: 0, width: 28, depth: 28, height: 45, model: '/models/workLamp.obj', color: '#d4af37', floorLevel: 0 },
    { id: 'fn_b1_night_right', catalogId: 'bedsideTable', name: 'Master Bedside Table Right', category: 'Bedroom', x: -150, y: -570, elevation: 0, angle: 0, width: 50, depth: 45, height: 55, model: '/models/bedsideTable.obj', color: '#5c3d2e', floorLevel: 0 },
    { id: 'fn_b1_lamp_right', catalogId: 'workLamp', name: 'Brass Orb Table Lamp Right', category: 'Lighting', x: -150, y: -570, elevation: 55, angle: 0, width: 28, depth: 28, height: 45, model: '/models/workLamp.obj', color: '#d4af37', floorLevel: 0 },
    // Full-Width 3-Door Sliding Mirrored Wardrobe (Image 1 & 2 Match)
    {
      id: 'fn_b1_wardrobe',
      catalogId: 'wardrobe',
      name: 'Full-Width Sliding Mirrored Wardrobe',
      category: 'Storage',
      x: -280,
      y: -305,
      elevation: 0,
      angle: Math.PI,
      width: 320,
      depth: 60,
      height: 220,
      model: '/models/wardrobe.obj',
      color: '#1e293b',
      floorLevel: 0
    },
    // Attached Toilet Walk-in Glass Shower Enclosure (Image 2 Match)
    {
      id: 'fn_att_shower',
      catalogId: 'shower',
      name: 'Frameless Glass Walk-in Shower Enclosure',
      category: 'Bathroom',
      x: -30,
      y: -580,
      elevation: 0,
      angle: 0,
      width: 95,
      depth: 95,
      height: 215,
      model: '/models/shower.obj',
      color: '#ffffff',
      floorLevel: 0
    },
    // Attached Toilet Porcelain Vanity & Mirror
    {
      id: 'fn_att_vanity',
      catalogId: 'washbasinWithCabinet',
      name: 'Calacatta Marble Vanity Counter & Bowl',
      category: 'Bathroom',
      x: -30,
      y: -480,
      elevation: 0,
      angle: 0,
      width: 80,
      depth: 50,
      height: 85,
      model: '/models/washbasinWithCabinet.obj',
      color: '#ffffff',
      floorLevel: 0
    },
    // Attached Toilet Commode
    {
      id: 'fn_att_commode',
      catalogId: 'toiletUnit',
      name: 'Wall-Hung Modern Commode',
      category: 'Bathroom',
      x: -30,
      y: -445,
      elevation: 0,
      angle: Math.PI,
      width: 45,
      depth: 65,
      height: 80,
      model: '/models/toiletUnit.obj',
      color: '#ffffff',
      floorLevel: 0
    },

    // ========================================================================
    // 8. BEDROOM 2 & COMMON TOILET (Image 1 & Image 2 Match)
    // ========================================================================
    // Bedroom 2 Bed against North Wall
    {
      id: 'fn_bed2_queen',
      catalogId: 'bed140x190',
      name: 'Modern Upholstered Queen Bed',
      category: 'Bedroom',
      x: 245,
      y: -510,
      elevation: 0,
      angle: 0,
      width: 170,
      depth: 205,
      height: 105,
      model: '/models/bed140x190.obj',
      color: '#334155',
      floorLevel: 0
    },
    { id: 'fn_b2_night_left', catalogId: 'bedsideTable', name: 'Bedside Nightstand Left', category: 'Bedroom', x: 120, y: -570, elevation: 0, angle: 0, width: 48, depth: 42, height: 55, model: '/models/bedsideTable.obj', color: '#5c3d2e', floorLevel: 0 },
    { id: 'fn_b2_night_right', catalogId: 'bedsideTable', name: 'Bedside Nightstand Right', category: 'Bedroom', x: 370, y: -570, elevation: 0, angle: 0, width: 48, depth: 42, height: 55, model: '/models/bedsideTable.obj', color: '#5c3d2e', floorLevel: 0 },
    // Full-Width Wardrobe along South Wall of Bedroom 2
    {
      id: 'fn_b2_wardrobe',
      catalogId: 'wardrobe',
      name: 'Full-Width Wardrobe Closet',
      category: 'Storage',
      x: 245,
      y: -305,
      elevation: 0,
      angle: Math.PI,
      width: 270,
      depth: 60,
      height: 220,
      model: '/models/wardrobe.obj',
      color: '#1e293b',
      floorLevel: 0
    },
    // Common Toilet Porcelain Bathtub (Image 2 Match)
    {
      id: 'fn_comm_bathtub',
      catalogId: 'bath',
      name: 'Built-in Deep Soaking Bathtub',
      category: 'Bathroom',
      x: 345,
      y: -215,
      elevation: 0,
      angle: 0,
      width: 155,
      depth: 75,
      height: 60,
      model: '/models/bath.obj',
      color: '#ffffff',
      floorLevel: 0
    },
    {
      id: 'fn_comm_vanity',
      catalogId: 'washbasinWithCabinet',
      name: 'Common Toilet Vanity Washbasin',
      category: 'Bathroom',
      x: 215,
      y: -245,
      elevation: 0,
      angle: 0,
      width: 70,
      depth: 48,
      height: 85,
      model: '/models/washbasinWithCabinet.obj',
      color: '#ffffff',
      floorLevel: 0
    },
    {
      id: 'fn_comm_commode',
      catalogId: 'toiletUnit',
      name: 'Common Toilet Commode',
      category: 'Bathroom',
      x: 420,
      y: -215,
      elevation: 0,
      angle: -Math.PI / 2,
      width: 45,
      depth: 65,
      height: 80,
      model: '/models/toiletUnit.obj',
      color: '#ffffff',
      floorLevel: 0
    },

    // ========================================================================
    // 9. INTERIOR DOORS & DAYLIGHT WINDOWS (Exact Blueprint Locations)
    // ========================================================================
    // Bedroom 1 Door
    { id: 'dr_b1', catalogId: 'door', name: 'Bedroom 1 Door', category: 'Doors & Windows', x: -95, y: -290, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },
    // Dressing Room Door
    { id: 'dr_dress', catalogId: 'door', name: 'Dressing Room Door', category: 'Doors & Windows', x: -35, y: -275, elevation: 0, angle: 0, width: 80, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },
    // Attached Toilet Door
    { id: 'dr_att_bath', catalogId: 'door', name: 'Attached Bath Door', category: 'Doors & Windows', x: -30, y: -425, elevation: 0, angle: Math.PI, width: 75, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },
    // Bedroom 2 Door
    { id: 'dr_b2', catalogId: 'door', name: 'Bedroom 2 Door', category: 'Doors & Windows', x: 95, y: -275, elevation: 0, angle: 0, width: 90, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },
    // Common Toilet Door
    { id: 'dr_comm_bath', catalogId: 'door', name: 'Common Toilet Door', category: 'Doors & Windows', x: 155, y: -215, elevation: 0, angle: Math.PI / 2, width: 75, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },
    // Store Room Door from Dining
    { id: 'dr_store', catalogId: 'door', name: 'Store Room Door', category: 'Doors & Windows', x: -215, y: 230, elevation: 0, angle: -Math.PI / 2, width: 75, depth: 15, height: 210, model: '/models/door.obj', color: '#f8fafc', floorLevel: 0 },

    // Windows
    { id: 'win_b1_top', catalogId: 'window85x123', name: 'Bedroom 1 Window', category: 'Doors & Windows', x: -280, y: -640, elevation: 90, angle: 0, width: 140, depth: 15, height: 130, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
    { id: 'win_b2_top', catalogId: 'window85x123', name: 'Bedroom 2 Window', category: 'Doors & Windows', x: 245, y: -640, elevation: 90, angle: 0, width: 140, depth: 15, height: 130, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
    { id: 'win_stair_left', catalogId: 'window85x123', name: 'Study West Window', category: 'Doors & Windows', x: -460, y: -175, elevation: 120, angle: Math.PI / 2, width: 120, depth: 15, height: 140, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
    { id: 'win_dining_left', catalogId: 'window85x123', name: 'Dining Window', category: 'Doors & Windows', x: -460, y: 50, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 130, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
    { id: 'win_kitchen_south', catalogId: 'window85x123', name: 'Kitchen South Window', category: 'Doors & Windows', x: -280, y: 640, elevation: 105, angle: Math.PI, width: 120, depth: 15, height: 110, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
    { id: 'win_living_veranda', catalogId: 'window85x123', name: 'Living Veranda Window', category: 'Doors & Windows', x: 220, y: 360, elevation: 90, angle: 0, width: 150, depth: 15, height: 140, model: '/models/window85x123.obj', color: '#ffffff', floorLevel: 0 },
  ],
  dimensionLines: [
    { id: 'dim_top_30', xStart: -460, yStart: -675, xEnd: 455, yEnd: -675, offset: 25, text: '30\'-0"' },
    { id: 'dim_left_42', xStart: -495, yStart: -640, xEnd: -495, yEnd: 640, offset: 25, text: '42\'-0"' },
    { id: 'dim_b1_w', xStart: -460, yStart: -260, xEnd: -95, yEnd: -260, offset: 15, text: '12\'-0"' },
    { id: 'dim_b2_w', xStart: 35, yStart: -260, xEnd: 455, yEnd: -260, offset: 15, text: '11\'-6"' },
    { id: 'dim_liv_w', xStart: -95, yStart: 375, xEnd: 455, yEnd: 375, offset: 15, text: '15\'-0"' },
  ],
  textNotes: [
    { id: 'txt_title', text: '30\'-0" × 42\'-0" LUXURY RESIDENCE (2 BHK + VERANDA + PARKING)', x: 0, y: 720, color: '#0f172a', fontSize: 16 },
    { id: 'txt_parking', text: 'PARKING', x: 600, y: 110, color: '#475569', fontSize: 14 },
  ],
  preferences: {
    unitSystem: 'ft_in',
    defaultWallThickness: 20,
    defaultWallHeight: 280,
    gridSize: 20,
    magnetismEnabled: true,
    showRulers: true,
  },
};

/**
 * Ensures realistic architecture by replacing artificial staircases in single-story homes
 * with functional living spaces (Executive Study / Home Office & Foyer).
 */
export function cleanUnrealisticStairs(inputPlan: HomePlan): HomePlan {
  if (!inputPlan || !inputPlan.furniture) return inputPlan;
  const hasDoglegStairs = inputPlan.furniture.some((f) => f.id === 'fn_dogleg_stairs');
  const hasDuplexStairs = inputPlan.furniture.some((f) => f.id === 'sf_duplex_stairs');
  if (!hasDoglegStairs && !hasDuplexStairs) return inputPlan;

  let updatedFurniture = inputPlan.furniture.filter(
    (f) => f.id !== 'fn_dogleg_stairs' && f.id !== 'sf_duplex_stairs'
  );

  // If fn_dogleg_stairs was removed, insert realistic Study / Home Office suite
  if (hasDoglegStairs && !updatedFurniture.some((f) => f.id === 'fn_study_desk')) {
    updatedFurniture = [
      ...updatedFurniture,
      {
        id: 'fn_study_desk',
        catalogId: 'squareTable',
        name: 'Executive Oak Work-From-Home Desk',
        category: 'Bedroom',
        x: -280,
        y: -175,
        elevation: 0,
        angle: 0,
        width: 140,
        depth: 70,
        height: 75,
        model: 'procedural:desk:{}',
        icon: '/models/squareTable.png',
        color: '#5c3d2e',
        floorLevel: 0,
      },
      {
        id: 'fn_study_chair',
        catalogId: 'chair',
        name: 'Ergonomic Leather Executive Swivel Chair',
        category: 'Bedroom',
        x: -280,
        y: -125,
        elevation: 0,
        angle: 0,
        width: 58,
        depth: 58,
        height: 95,
        model: 'procedural:chair:{"backrestStyle":"solid_panel","seatType":"cushioned","legStyle":"swivel_pedestal"}',
        icon: '/models/chair.png',
        color: '#1e293b',
        floorLevel: 0,
      },
      {
        id: 'fn_study_bookcase',
        catalogId: 'bookcase',
        name: 'Full-Height Built-In Library & Display Shelving',
        category: 'Storage',
        x: -360,
        y: -255,
        elevation: 0,
        angle: 0,
        width: 160,
        depth: 38,
        height: 220,
        model: '/models/bookcase.obj',
        icon: '/models/bookcase.png',
        color: '#334155',
        floorLevel: 0,
      },
      {
        id: 'fn_study_lamp',
        catalogId: 'tableLamp',
        name: 'Brushed Brass Task Reading Lamp',
        category: 'Lighting',
        x: -320,
        y: -185,
        elevation: 75,
        angle: 0,
        width: 25,
        depth: 25,
        height: 42,
        model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":22,"shadeHeight":18,"totalHeight":42}',
        icon: '/models/pendantLamp.png',
        color: '#d4af37',
        floorLevel: 0,
        placementType: 'tabletop',
        placeOnTable: true,
      },
      {
        id: 'fn_study_plant',
        catalogId: 'plant',
        name: 'Potted Fiddle Leaf Fig',
        category: 'Decor & Plants',
        x: -140,
        y: -240,
        elevation: 0,
        angle: 0,
        width: 45,
        depth: 45,
        height: 120,
        model: '/models/plant.obj',
        icon: '/models/plant.png',
        color: '#166534',
        floorLevel: 0,
      },
    ];
  }

  // If sf_duplex_stairs was removed, insert realistic foyer table
  if (hasDuplexStairs && !updatedFurniture.some((f) => f.id === 'sf_foyer_console')) {
    updatedFurniture = [
      ...updatedFurniture,
      { id: 'sf_foyer_console', catalogId: 'squareTable', name: 'Fluted Foyer Console Table', category: 'Living', x: -95, y: -80, elevation: 0, angle: Math.PI / 2, width: 100, depth: 32, height: 80, model: 'procedural:table:{"shape":"rectangular","topThickness":4,"legThickness":3}', icon: '/models/squareTable.png', color: '#c29f79', floorLevel: 0 },
      { id: 'sf_foyer_plant', catalogId: 'plant', name: 'Potted Fiddle Leaf Fig', category: 'Decor & Plants', x: -85, y: 120, elevation: 0, angle: 0, width: 45, depth: 45, height: 110, model: '/models/plant.obj', icon: '/models/plant.png', color: '#166534', floorLevel: 0 },
    ];
  }

  const updatedRooms = inputPlan.rooms.map((r) =>
    r.id === 'rm_staircase'
      ? { ...r, id: 'rm_study', name: 'Study & Home Office (12\'0" × 6\'6")' }
      : r
  );

  return {
    ...inputPlan,
    rooms: updatedRooms,
    furniture: updatedFurniture,
  };
}
