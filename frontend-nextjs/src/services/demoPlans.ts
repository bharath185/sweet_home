import { HomePlan } from '../types/plan';

// ============================================================================
// 1. EMPTY HOME (Architectural Shell with Entrance Door & Daylight Windows)
// ============================================================================
export const emptyHomePlan: HomePlan = {
  id: 'demo-empty-home',
  name: 'Empty home',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    { id: 'ew_1', xStart: -350, yStart: -250, xEnd: 350, yEnd: -250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew_2', xStart: 350, yStart: -250, xEnd: 350, yEnd: 250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew_3', xStart: 350, yStart: 250, xEnd: -350, yEnd: 250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'ew_4', xStart: -350, yStart: 250, xEnd: -350, yEnd: -250, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
  ],
  furniture: [
    // Entrance front door with lever handle so user can walk right in during Tour mode
    { id: 'ew_d_front', catalogId: 'doorModernFlush', name: 'Front Entrance Door', category: 'Doors & Windows', x: 0, y: 250, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0, description: 'Main timber entry door' },
    // Natural daylight sliding windows
    { id: 'ew_w_north', catalogId: 'windowModernSliding', name: 'North Daylight Window', category: 'Doors & Windows', x: 0, y: -250, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'ew_w_east', catalogId: 'windowModernSliding', name: 'East Daylight Window', category: 'Doors & Windows', x: 350, y: 0, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    // Ceiling light fixture for illumination
    { id: 'ew_light', catalogId: 'pendantLamp', name: 'Center Ceiling Downlight', category: 'Lighting', x: 0, y: 0, elevation: 230, angle: 0, width: 40, depth: 40, height: 40, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":35,"shadeHeight":20,"totalHeight":45}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'ceiling' },
  ],
  rooms: [
    {
      id: 'er_1',
      name: 'Open Floor Plan',
      floorLevel: 0,
      points: [
        { x: -350, y: -250 },
        { x: 350, y: -250 },
        { x: 350, y: 250 },
        { x: -350, y: 250 },
      ],
      floorColor: '#f1f5f9',
      areaSquareMeters: 35.0,
    },
  ],
  dimensionLines: [
    { id: 'dim_e_top', xStart: -350, yStart: -275, xEnd: 350, yEnd: -275, offset: 20, text: '700' },
    { id: 'dim_e_side', xStart: 375, yStart: -250, xEnd: 375, yEnd: 250, offset: 20, text: '500' },
  ],
  textNotes: [
    { id: 'note_empty', text: 'Empty home - Ready for catalog interior design', x: 0, y: 180, color: '#64748b', fontSize: 15 },
  ],
  preferences: {
    unitSystem: 'cm',
    defaultWallThickness: 15,
    defaultWallHeight: 260,
    gridSize: 20,
    magnetismEnabled: true,
    showRulers: true,
  },
};

// ============================================================================
// 2. STUDIO (Complete Modern Urban Studio Loft with Bath & Kitchenette)
// ============================================================================
export const studioPlan: HomePlan = {
  id: 'demo-studio',
  name: 'Studio',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor Studio', elevation: 0, height: 260 },
  ],
  walls: [
    // Outer perimeter
    { id: 'sw_n', xStart: -300, yStart: -240, xEnd: 300, yEnd: -240, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw_e', xStart: 300, yStart: -240, xEnd: 300, yEnd: 240, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw_s', xStart: 300, yStart: 240, xEnd: -300, yEnd: 240, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'sw_w', xStart: -300, yStart: 240, xEnd: -300, yEnd: -240, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    // Bathroom enclosure partitions (bottom-left corner)
    { id: 'sw_bp1', xStart: -300, yStart: 60, xEnd: -130, yEnd: 60, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
    { id: 'sw_bp2', xStart: -130, yStart: 60, xEnd: -130, yEnd: 240, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
  ],
  furniture: [
    // Doors & Windows
    { id: 'sd_front', catalogId: 'doorModernFlush', name: 'Studio Entry Door', category: 'Doors & Windows', x: 180, y: 240, elevation: 0, angle: 0, width: 90, depth: 12, height: 210, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'sd_bath', catalogId: 'doorModernFlush', name: 'Bathroom Privacy Door', category: 'Doors & Windows', x: -130, y: 150, elevation: 0, angle: Math.PI / 2, width: 80, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'sw_win_main', catalogId: 'windowPanoramic', name: 'Balcony View Panoramic Window', category: 'Doors & Windows', x: 40, y: -240, elevation: 90, angle: 0, width: 180, depth: 15, height: 130, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#334155', floorLevel: 0 },
    { id: 'sw_win_bath', catalogId: 'windowModernSliding', name: 'Bathroom Frosted Window', category: 'Doors & Windows', x: -300, y: 150, elevation: 110, angle: Math.PI / 2, width: 70, depth: 15, height: 80, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Kitchenette Zone (Top-Left)
    { id: 'sf_ksink', catalogId: 'kitchenCabinet', name: 'Kitchen Counter & Sink', category: 'Kitchen', x: -220, y: -205, elevation: 0, angle: 0, width: 110, depth: 60, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#f8fafc', floorLevel: 0 },
    { id: 'sf_cooker', catalogId: 'cooker', name: 'Induction Cooktop Stove', category: 'Kitchen', x: -140, y: -205, elevation: 0, angle: 0, width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png', color: '#1e293b', floorLevel: 0 },
    { id: 'sf_fridge', catalogId: 'refrigerator', name: 'Studio Refrigerator', category: 'Kitchen', x: -70, y: -200, elevation: 0, angle: 0, width: 70, depth: 65, height: 160, model: 'procedural:cabinet:{"columns":1,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#cbd5e1', floorLevel: 0 },
    { id: 'sf_btable', catalogId: 'roundTable', name: 'Bistro Dining Table', category: 'Kitchen', x: -200, y: -70, elevation: 0, angle: 0, width: 75, depth: 75, height: 75, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'sf_bchair1', catalogId: 'chair', name: 'Bistro Chair 1', category: 'Kitchen', x: -200, y: -115, elevation: 0, angle: 0, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#ea580c', floorLevel: 0 },
    { id: 'sf_bchair2', catalogId: 'chair', name: 'Bistro Chair 2', category: 'Kitchen', x: -200, y: -25, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#ea580c', floorLevel: 0 },

    // Living & Media Zone (Center)
    { id: 'sf_sofa', catalogId: 'sofa', name: 'Velvet Studio Sofa', category: 'Living', x: 20, y: -50, elevation: 0, angle: 0, width: 170, depth: 85, height: 80, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'sf_coffeet', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: 20, y: 25, elevation: 0, angle: 0, width: 70, depth: 70, height: 42, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'sf_rug', catalogId: 'bathmat', name: 'Soft Living Area Rug', category: 'Living', x: 20, y: 10, elevation: 1, angle: 0, width: 160, depth: 120, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0f766e', floorLevel: 0 },
    { id: 'sf_tv', catalogId: 'tvUnit', name: 'Smart TV Console', category: 'Living', x: 20, y: 140, elevation: 0, angle: Math.PI, width: 140, depth: 42, height: 50, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'sf_plant', catalogId: 'plant', name: 'Indoor Fiddle-Leaf Fig', category: 'Living', x: 130, y: -200, elevation: 0, angle: 0, width: 50, depth: 50, height: 125, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },

    // Bedroom Corner (Right Wing)
    { id: 'sf_bed', catalogId: 'bed140x190', name: 'Comfort Double Bed', category: 'Bedroom', x: 215, y: -80, elevation: 0, angle: Math.PI / 2, width: 150, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#f43f5e', floorLevel: 0 },
    { id: 'sf_ns', catalogId: 'bedsideTable', name: 'Nightstand Table', category: 'Bedroom', x: 215, y: 35, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'sf_lamp', catalogId: 'tableLamp', name: 'Bedside Night Lamp', category: 'Lighting', x: 215, y: 35, elevation: 50, angle: 0, width: 22, depth: 22, height: 35, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":35}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'sf_ward', catalogId: 'wardrobe', name: '2-Door Wardrobe Closet', category: 'Bedroom', x: 260, y: 150, elevation: 0, angle: -Math.PI / 2, width: 110, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },
    { id: 'sf_bookc', catalogId: 'bookcase', name: 'Urban Bookshelf', category: 'Living', x: -80, y: 60, elevation: 0, angle: Math.PI / 2, width: 85, depth: 35, height: 175, model: '/models/bookcase.obj', icon: '/models/bookcase.png', color: '#334155', floorLevel: 0 },

    // Modern Bathroom Suite (Bottom-Left)
    { id: 'sf_shower', catalogId: 'bath', name: 'Studio Shower / Bath', category: 'Bathroom', x: -225, y: 105, elevation: 0, angle: 0, width: 130, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'sf_wash', catalogId: 'washbasin', name: 'Vanity Washbasin', category: 'Bathroom', x: -260, y: 195, elevation: 0, angle: 0, width: 65, depth: 48, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'sf_wc', catalogId: 'toiletUnit', name: 'Porcelain Toilet Suite', category: 'Bathroom', x: -185, y: 195, elevation: 0, angle: 0, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'sf_bmat', catalogId: 'bathmat', name: 'Plush Bath Mat', category: 'Bathroom', x: -225, y: 155, elevation: 1, angle: 0, width: 65, depth: 40, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0284c7', floorLevel: 0 },

    // Lighting Fixtures
    { id: 'sf_ch1', catalogId: 'chandelier', name: 'Living Chandelier', category: 'Lighting', x: 20, y: -20, elevation: 220, angle: 0, width: 50, depth: 50, height: 50, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":50,"shadeHeight":40,"totalHeight":50}', icon: '/models/pendantLamp.png', color: '#fde047', floorLevel: 0, placementType: 'ceiling' },
    { id: 'sf_kpendant', catalogId: 'pendantLamp', name: 'Kitchen Pendant Downlight', category: 'Lighting', x: -160, y: -140, elevation: 220, angle: 0, width: 35, depth: 35, height: 35, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":30,"shadeHeight":18,"totalHeight":35}', icon: '/models/pendantLamp.png', color: '#38bdf8', floorLevel: 0, placementType: 'ceiling' },
  ],
  rooms: [
    {
      id: 'sr_main',
      name: 'Studio Living & Bed Salon',
      floorLevel: 0,
      points: [
        { x: -300, y: -240 },
        { x: 300, y: -240 },
        { x: 300, y: 240 },
        { x: -130, y: 240 },
        { x: -130, y: 60 },
        { x: -300, y: 60 },
      ],
      floorColor: '#e2d9cc', // Natural hardwood
      areaSquareMeters: 23.8,
    },
    {
      id: 'sr_bath',
      name: 'Ensuite Bathroom',
      floorLevel: 0,
      points: [
        { x: -300, y: 60 },
        { x: -130, y: 60 },
        { x: -130, y: 240 },
        { x: -300, y: 240 },
      ],
      floorColor: '#0284c7', // Sky blue ceramic tile
      areaSquareMeters: 3.1,
    },
  ],
  dimensionLines: [
    { id: 'dim_s_w', xStart: -300, yStart: -265, xEnd: 300, yEnd: -265, offset: 20, text: '600' },
    { id: 'dim_s_h', xStart: 325, yStart: -240, xEnd: 325, yEnd: 240, offset: 20, text: '480' },
  ],
  textNotes: [
    { id: 'sn_title', text: 'Studio Loft Apartment', x: 20, y: 200, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 15, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 3. 1-BEDROOM APARTMENT (Warm Timber Floors, Private Master & Spa Bath)
// ============================================================================
export const oneBedroomAptPlan: HomePlan = {
  id: 'demo-1-bedroom-apt',
  name: '1-Bedroom apartment',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    // Outer perimeter
    { id: 'w1b_1', xStart: -380, yStart: -250, xEnd: 380, yEnd: -250, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w1b_2', xStart: 380, yStart: -250, xEnd: 380, yEnd: 250, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w1b_3', xStart: 380, yStart: 250, xEnd: -380, yEnd: 250, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w1b_4', xStart: -380, yStart: 250, xEnd: -380, yEnd: -250, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    // Interior dividing walls
    { id: 'w1b_p1', xStart: 40, yStart: -250, xEnd: 40, yEnd: 250, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
    { id: 'w1b_p2', xStart: 40, yStart: 60, xEnd: 380, yEnd: 60, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
  ],
  furniture: [
    // Doors connecting all spaces
    { id: 'f1b_d_front', catalogId: 'doorModernFlush', name: 'Apartment Entrance Door', category: 'Doors & Windows', x: -170, y: 250, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f1b_d_bed', catalogId: 'doorModernFlush', name: 'Master Bedroom Door', category: 'Doors & Windows', x: 40, y: -70, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_d_bath', catalogId: 'doorModernFlush', name: 'Bathroom Privacy Door', category: 'Doors & Windows', x: 40, y: 155, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Windows with natural outdoor views
    { id: 'f1b_w_liv', catalogId: 'windowModernSliding', name: 'Living Room Sliding Window', category: 'Doors & Windows', x: -170, y: -250, elevation: 90, angle: 0, width: 150, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_w_side', catalogId: 'windowModernSliding', name: 'Living West Side Window', category: 'Doors & Windows', x: -380, y: 0, elevation: 90, angle: Math.PI / 2, width: 120, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_w_bed', catalogId: 'windowModernSliding', name: 'Bedroom East Window', category: 'Doors & Windows', x: 380, y: -100, elevation: 90, angle: Math.PI / 2, width: 130, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_w_bath', catalogId: 'windowModernSliding', name: 'Bathroom Frosted Window', category: 'Doors & Windows', x: 380, y: 160, elevation: 110, angle: Math.PI / 2, width: 80, depth: 15, height: 80, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Living & Dining Hall
    { id: 'f1b_sofa', catalogId: 'sofa', name: 'Lounge Comfort Sofa', category: 'Living', x: -200, y: -120, elevation: 0, angle: 0, width: 210, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f1b_ctable', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: -200, y: -20, elevation: 0, angle: 0, width: 80, depth: 80, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f1b_rug', catalogId: 'bathmat', name: 'Living Plush Area Rug', category: 'Living', x: -200, y: -30, elevation: 1, angle: 0, width: 180, depth: 140, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#15803d', floorLevel: 0 },
    { id: 'f1b_arm', catalogId: 'armchair', name: 'Accent Armchair', category: 'Living', x: -90, y: -20, elevation: 0, angle: -Math.PI / 2, width: 80, depth: 80, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 0 },
    { id: 'f1b_tv', catalogId: 'tvUnit', name: 'LED TV & Media Console', category: 'Living', x: -200, y: 80, elevation: 0, angle: Math.PI, width: 160, depth: 45, height: 52, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f1b_plant', catalogId: 'plant', name: 'Indoor Fiddle Fig', category: 'Living', x: -330, y: -190, elevation: 0, angle: 0, width: 50, depth: 50, height: 130, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },
    { id: 'f1b_ch', catalogId: 'chandelier', name: 'Ceiling Chandelier', category: 'Lighting', x: -200, y: -30, elevation: 220, angle: 0, width: 55, depth: 55, height: 55, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":55,"shadeHeight":45,"totalHeight":55}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'ceiling' },

    // Dining Corner
    { id: 'f1b_dtable', catalogId: 'squareTable', name: 'Dining Table', category: 'Living', x: -40, y: 160, elevation: 0, angle: 0, width: 120, depth: 80, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'f1b_dch1', catalogId: 'chair', name: 'Dining Chair 1', category: 'Living', x: -40, y: 110, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#ea580c', floorLevel: 0 },
    { id: 'f1b_dch2', catalogId: 'chair', name: 'Dining Chair 2', category: 'Living', x: -40, y: 210, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#ea580c', floorLevel: 0 },

    // Kitchen Counter Run
    { id: 'f1b_kcab', catalogId: 'kitchenCabinet', name: 'Kitchen Counter & Sink', category: 'Kitchen', x: -330, y: 130, elevation: 0, angle: Math.PI / 2, width: 120, depth: 60, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#f8fafc', floorLevel: 0 },
    { id: 'f1b_kcook', catalogId: 'cooker', name: 'Cooktop Range', category: 'Kitchen', x: -330, y: 40, elevation: 0, angle: Math.PI / 2, width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f1b_kfridge', catalogId: 'refrigerator', name: 'Refrigerator', category: 'Kitchen', x: -330, y: -40, elevation: 0, angle: Math.PI / 2, width: 75, depth: 70, height: 180, model: 'procedural:cabinet:{"columns":1,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#cbd5e1', floorLevel: 0 },

    // Master Bedroom Suite
    { id: 'f1b_bed', catalogId: 'bed140x190', name: 'Master Queen Bed', category: 'Bedroom', x: 210, y: -120, elevation: 0, angle: 0, width: 160, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#3b82f6', floorLevel: 0 },
    { id: 'f1b_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: 100, y: -120, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f1b_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: 320, y: -120, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f1b_lamp1', catalogId: 'tableLamp', name: 'Bedside Lamp Left', category: 'Lighting', x: 100, y: -120, elevation: 50, angle: 0, width: 22, depth: 22, height: 38, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f1b_lamp2', catalogId: 'tableLamp', name: 'Bedside Lamp Right', category: 'Lighting', x: 320, y: -120, elevation: 50, angle: 0, width: 22, depth: 22, height: 38, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f1b_ward', catalogId: 'wardrobe', name: '2-Door Wardrobe Closet', category: 'Bedroom', x: 210, y: 15, elevation: 0, angle: 0, width: 140, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Ensuite Bathroom
    { id: 'f1b_bath', catalogId: 'bath', name: 'Deep Soaking Bathtub', category: 'Bathroom', x: 210, y: 195, elevation: 0, angle: 0, width: 150, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_wash', catalogId: 'washbasin', name: 'Vanity Washbasin', category: 'Bathroom', x: 95, y: 195, elevation: 0, angle: Math.PI / 2, width: 70, depth: 50, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_wc', catalogId: 'toiletUnit', name: 'Porcelain Toilet', category: 'Bathroom', x: 95, y: 110, elevation: 0, angle: Math.PI / 2, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f1b_bmat', catalogId: 'bathmat', name: 'Bathroom Plush Mat', category: 'Bathroom', x: 210, y: 140, elevation: 1, angle: 0, width: 70, depth: 45, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0284c7', floorLevel: 0 },
    { id: 'f1b_rad', catalogId: 'radiator', name: 'Towel Warmer Radiator', category: 'Bathroom', x: 370, y: 90, elevation: 30, angle: -Math.PI / 2, width: 50, depth: 10, height: 70, model: 'procedural:decor:{"type":"wall_art"}', icon: '/models/tvUnit.png', color: '#ffffff', floorLevel: 0, placementType: 'wall' },
  ],
  rooms: [
    { id: 'r1b_1', name: 'Living & Dining Hall', floorLevel: 0, points: [{ x: -380, y: -250 }, { x: 40, y: -250 }, { x: 40, y: 250 }, { x: -380, y: 250 }], floorColor: '#3e2723', areaSquareMeters: 21.0 },
    { id: 'r1b_2', name: 'Master Bedroom', floorLevel: 0, points: [{ x: 40, y: -250 }, { x: 380, y: -250 }, { x: 380, y: 60 }, { x: 40, y: 60 }], floorColor: '#fef3c7', areaSquareMeters: 10.5 },
    { id: 'r1b_3', name: 'Ensuite Bathroom', floorLevel: 0, points: [{ x: 40, y: 60 }, { x: 380, y: 60 }, { x: 380, y: 250 }, { x: 40, y: 250 }], floorColor: '#0284c7', areaSquareMeters: 6.4 },
  ],
  dimensionLines: [
    { id: 'dim_1b_w', xStart: -380, yStart: -275, xEnd: 380, yEnd: -275, offset: 20, text: '760' },
    { id: 'dim_1b_h', xStart: 405, yStart: -250, xEnd: 405, yEnd: 250, offset: 20, text: '500' },
  ],
  textNotes: [
    { id: 'n1b_title', text: '1-Bedroom apartment', x: -170, y: 200, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 16, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 4. 2-BEDROOM APARTMENT (Exact Sweet Home 3D Reference Demo)
// ============================================================================
export const twoBedroomAptPlan: HomePlan = {
  id: 'demo-2-bedroom-apt',
  name: 'Two bedroom apartment',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    // Outer perimeter walls (L-shape matching blueprint)
    { id: 'w2b_top', xStart: -550, yStart: -240, xEnd: 550, yEnd: -240, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_right', xStart: 550, yStart: -240, xEnd: 550, yEnd: 234, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_liv_bot', xStart: 550, yStart: 234, xEnd: 183, yEnd: 234, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_corr_bot', xStart: 183, yStart: 234, xEnd: -176, yEnd: 234, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_bed1_r', xStart: -176, yStart: 234, xEnd: -176, yEnd: 549, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_bed1_b', xStart: -176, yStart: 549, xEnd: -550, yEnd: 549, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },
    { id: 'w2b_left', xStart: -550, yStart: 549, xEnd: -550, yEnd: -240, thickness: 18, height: 260, color: '#1e293b', floorLevel: 0 },

    // Interior dividing walls
    { id: 'w2b_p_h1', xStart: -550, yStart: -1, xEnd: 183, yEnd: -1, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
    { id: 'w2b_p_h2', xStart: -550, yStart: -25, xEnd: -350, yEnd: -25, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
    { id: 'w2b_p_v1', xStart: -86, yStart: -240, xEnd: -86, yEnd: -1, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
    { id: 'w2b_p_v2', xStart: 183, yStart: -240, xEnd: 183, yEnd: 234, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
    { id: 'w2b_p_v3', xStart: -350, yStart: -25, xEnd: -350, yEnd: 214, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
    { id: 'w2b_p_h3', xStart: -550, yStart: 214, xEnd: -176, yEnd: 214, thickness: 12, height: 260, color: '#334155', floorLevel: 0 },
  ],
  furniture: [
    // Doors connecting all spaces
    { id: 'f2b_d_front', catalogId: 'doorModernFlush', name: 'Apartment Entrance Front Door', category: 'Doors & Windows', x: 20, y: 234, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0, description: 'Heavy timber front entrance security door with brushed nickel lever' },
    { id: 'f2b_d_bed1', catalogId: 'doorModernFlush', name: 'Master Bedroom Door', category: 'Doors & Windows', x: -360, y: 214, elevation: 0, angle: 0, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_d_bath', catalogId: 'doorModernFlush', name: 'Bathroom Privacy Door', category: 'Doors & Windows', x: -350, y: 95, elevation: 0, angle: Math.PI / 2, width: 80, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_d_bed2', catalogId: 'doorModernFlush', name: 'Bedroom #2 Door', category: 'Doors & Windows', x: -220, y: -1, elevation: 0, angle: 0, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_d_kit', catalogId: 'doorModernFlush', name: 'Kitchen Pocket Door', category: 'Doors & Windows', x: 50, y: -1, elevation: 0, angle: 0, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_d_liv', catalogId: 'doorGlassFrench', name: 'Double French Living Room Door', category: 'Doors & Windows', x: 183, y: 110, elevation: 0, angle: Math.PI / 2, width: 130, depth: 12, height: 215, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Windows with natural outdoor views
    { id: 'f2b_w_liv_n', catalogId: 'windowModernSliding', name: 'Living Room North Window', category: 'Doors & Windows', x: 380, y: -240, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_liv_s', catalogId: 'windowModernSliding', name: 'Living Room South Window', category: 'Doors & Windows', x: 380, y: 234, elevation: 90, angle: 0, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_kit', catalogId: 'windowModernSliding', name: 'Kitchen Casement Window', category: 'Doors & Windows', x: 50, y: -240, elevation: 90, angle: 0, width: 120, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_b2_1', catalogId: 'windowModernSliding', name: 'Bedroom #2 Window East', category: 'Doors & Windows', x: -220, y: -240, elevation: 90, angle: 0, width: 120, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_b2_2', catalogId: 'windowModernSliding', name: 'Bedroom #2 Window West', category: 'Doors & Windows', x: -450, y: -240, elevation: 90, angle: 0, width: 120, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_bath', catalogId: 'windowModernSliding', name: 'Bathroom Frosted Window', category: 'Doors & Windows', x: -550, y: 95, elevation: 110, angle: Math.PI / 2, width: 80, depth: 15, height: 90, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_w_bed1', catalogId: 'windowModernSliding', name: 'Master Bedroom South Window', category: 'Doors & Windows', x: -360, y: 549, elevation: 90, angle: 0, width: 150, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Living Room
    { id: 'f2b_sofa', catalogId: 'sofa', name: 'Corner Lounge Sofa', category: 'Living', x: 440, y: -130, elevation: 0, angle: 0, width: 200, depth: 160, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'f2b_ct', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: 420, y: -40, elevation: 0, angle: Math.PI / 4, width: 80, depth: 80, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f2b_rug_liv', catalogId: 'bathmat', name: 'Living Room Plush Area Rug', category: 'Living', x: 420, y: -50, elevation: 1, angle: 0, width: 190, depth: 150, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0f766e', floorLevel: 0 },
    { id: 'f2b_arm', catalogId: 'armchair', name: 'Comfort Armchair', category: 'Living', x: 480, y: 50, elevation: 0, angle: -Math.PI / 3, width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#0284c7', floorLevel: 0 },
    { id: 'f2b_tv', catalogId: 'tvUnit', name: 'Smart LED TV & Media Console', category: 'Living', x: 235, y: -80, elevation: 0, angle: Math.PI / 2, width: 160, depth: 45, height: 60, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f2b_dt', catalogId: 'squareTable', name: 'Formal Dining Table', category: 'Living', x: 380, y: 140, elevation: 0, angle: 0, width: 130, depth: 90, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'f2b_dt_c1', catalogId: 'chair', name: 'Dining Chair North', category: 'Living', x: 380, y: 85, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f2b_dt_c2', catalogId: 'chair', name: 'Dining Chair South', category: 'Living', x: 380, y: 195, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f2b_dt_c3', catalogId: 'chair', name: 'Dining Chair West', category: 'Living', x: 310, y: 140, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f2b_dt_c4', catalogId: 'chair', name: 'Dining Chair East', category: 'Living', x: 450, y: 140, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f2b_plant_liv', catalogId: 'plant', name: 'Indoor Fiddle-Leaf Fig Plant', category: 'Living', x: 515, y: 200, elevation: 0, angle: 0, width: 50, depth: 50, height: 130, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },
    { id: 'f2b_light_liv', catalogId: 'chandelier', name: 'Living Room Ceiling Chandelier', category: 'Lighting', x: 380, y: 0, elevation: 220, angle: 0, width: 60, depth: 60, height: 60, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":60,"shadeHeight":50,"totalHeight":60}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'ceiling' },

    // Kitchen
    { id: 'f2b_ksink', catalogId: 'kitchenCabinet', name: 'Kitchen Counter & Double Sink', category: 'Kitchen', x: 20, y: -210, elevation: 0, angle: 0, width: 90, depth: 60, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#f8fafc', floorLevel: 0 },
    { id: 'f2b_cook', catalogId: 'cooker', name: 'Induction Cooktop Stove', category: 'Kitchen', x: -50, y: -210, elevation: 0, angle: 0, width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f2b_fridge', catalogId: 'refrigerator', name: 'Double-Door Refrigerator', category: 'Kitchen', x: 140, y: -195, elevation: 0, angle: 0, width: 85, depth: 75, height: 185, model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#cbd5e1', floorLevel: 0 },
    { id: 'f2b_ktable', catalogId: 'roundTable', name: 'Breakfast Dining Table', category: 'Kitchen', x: 50, y: -100, elevation: 0, angle: 0, width: 90, depth: 90, height: 75, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#334155', floorLevel: 0 },
    { id: 'f2b_kch1', catalogId: 'chair', name: 'Breakfast Chair North', category: 'Kitchen', x: 50, y: -150, elevation: 0, angle: 0, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#e2e8f0', floorLevel: 0 },
    { id: 'f2b_kch2', catalogId: 'chair', name: 'Breakfast Chair South', category: 'Kitchen', x: 50, y: -50, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#e2e8f0', floorLevel: 0 },
    { id: 'f2b_kch3', catalogId: 'chair', name: 'Breakfast Chair West', category: 'Kitchen', x: 0, y: -100, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#e2e8f0', floorLevel: 0 },
    { id: 'f2b_kch4', catalogId: 'chair', name: 'Breakfast Chair East', category: 'Kitchen', x: 100, y: -100, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#e2e8f0', floorLevel: 0 },
    { id: 'f2b_k_light', catalogId: 'pendantLamp', name: 'Kitchen Pendant Downlight', category: 'Lighting', x: 50, y: -100, elevation: 210, angle: 0, width: 40, depth: 40, height: 40, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":35,"shadeHeight":20,"totalHeight":45}', icon: '/models/pendantLamp.png', color: '#38bdf8', floorLevel: 0, placementType: 'ceiling' },

    // Bedroom #2 (Guest / Study)
    { id: 'f2b_b2_bed', catalogId: 'bed90x190', name: 'Single Daybed #2', category: 'Bedroom', x: -480, y: -160, elevation: 0, angle: 0, width: 100, depth: 190, height: 85, model: '/models/bed90x190.obj', icon: '/models/bed90x190.png', color: '#fef08a', floorLevel: 0 },
    { id: 'f2b_b2_ward', catalogId: 'wardrobe', name: 'Red Wardrobe Closet', category: 'Bedroom', x: -140, y: -200, elevation: 0, angle: 0, width: 110, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#b91c1c', floorLevel: 0 },
    { id: 'f2b_b2_desk', catalogId: 'squareTable', name: 'Red Study Writing Desk', category: 'Bedroom', x: -280, y: -200, elevation: 0, angle: 0, width: 120, depth: 60, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#b91c1c', floorLevel: 0 },
    { id: 'f2b_b2_chair', catalogId: 'chair', name: 'Study Task Chair', category: 'Bedroom', x: -280, y: -150, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#334155', floorLevel: 0 },
    { id: 'f2b_b2_lamp', catalogId: 'workLamp', name: 'Work Desk Lamp', category: 'Lighting', x: -310, y: -210, elevation: 75, angle: 0, width: 20, depth: 25, height: 40, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":40}', icon: '/models/pendantLamp.png', color: '#f59e0b', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },

    // Bathroom
    { id: 'f2b_bath', catalogId: 'bath', name: 'Luxury Full Bath', category: 'Bathroom', x: -450, y: 50, elevation: 0, angle: 0, width: 160, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_wash', catalogId: 'washbasin', name: 'Vanity Washbasin Cabinet', category: 'Bathroom', x: -450, y: 155, elevation: 0, angle: 0, width: 85, depth: 50, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_wc', catalogId: 'toiletUnit', name: 'Modern Toilet Suite', category: 'Bathroom', x: -385, y: 155, elevation: 0, angle: 0, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f2b_bathmat', catalogId: 'bathmat', name: 'Seafoam Plush Bath Mat', category: 'Bathroom', x: -450, y: 100, elevation: 1, angle: 0, width: 75, depth: 45, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0d9488', floorLevel: 0 },
    { id: 'f2b_rad_bath', catalogId: 'radiator', name: 'Heated Towel Rail Radiator', category: 'Bathroom', x: -545, y: 15, elevation: 30, angle: Math.PI / 2, width: 60, depth: 10, height: 80, model: 'procedural:decor:{"type":"wall_art"}', icon: '/models/tvUnit.png', color: '#e2e8f0', floorLevel: 0, placementType: 'wall' },

    // Bedroom #1 (Master Suite)
    { id: 'f2b_b1_ward', catalogId: 'wardrobe', name: 'Master 4-Door Wardrobe Closet', category: 'Bedroom', x: -360, y: 260, elevation: 0, angle: 0, width: 280, depth: 60, height: 215, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#ea580c', floorLevel: 0 },
    { id: 'f2b_b1_bed', catalogId: 'bed140x190', name: 'Master Tufted Double Bed', category: 'Bedroom', x: -360, y: 440, elevation: 0, angle: 0, width: 170, depth: 200, height: 95, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#a16207', floorLevel: 0 },
    { id: 'f2b_b1_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: -480, y: 440, elevation: 0, angle: 0, width: 48, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f2b_b1_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: -240, y: 440, elevation: 0, angle: 0, width: 48, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f2b_b1_lamp1', catalogId: 'tableLamp', name: 'Bedside Lamp Left', category: 'Lighting', x: -480, y: 440, elevation: 50, angle: 0, width: 25, depth: 25, height: 40, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":20,"shadeHeight":16,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f2b_b1_lamp2', catalogId: 'tableLamp', name: 'Bedside Lamp Right', category: 'Lighting', x: -240, y: 440, elevation: 50, angle: 0, width: 25, depth: 25, height: 40, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":20,"shadeHeight":16,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f2b_b1_light', catalogId: 'pendantLamp', name: 'Master Bedroom Ceiling Pendant', category: 'Lighting', x: -360, y: 350, elevation: 220, angle: 0, width: 45, depth: 45, height: 45, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":42,"shadeHeight":25,"totalHeight":50}', icon: '/models/pendantLamp.png', color: '#f59e0b', floorLevel: 0, placementType: 'ceiling' },
  ],
  rooms: [
    { id: 'r2b_liv', name: 'Living room', floorLevel: 0, points: [{ x: 183, y: -240 }, { x: 550, y: -240 }, { x: 550, y: 234 }, { x: 183, y: 234 }], floorColor: '#7dd3fc', areaSquareMeters: 16.02 },
    { id: 'r2b_kit', name: 'Kitchen', floorLevel: 0, points: [{ x: -86, y: -240 }, { x: 183, y: -240 }, { x: 183, y: -1 }, { x: -86, y: -1 }], floorColor: '#fef08a', areaSquareMeters: 9.77 },
    { id: 'r2b_bed2', name: 'Bedroom #2', floorLevel: 0, points: [{ x: -550, y: -240 }, { x: -86, y: -240 }, { x: -86, y: -1 }, { x: -350, y: -1 }, { x: -350, y: -25 }, { x: -550, y: -25 }], floorColor: '#fbcfe8', areaSquareMeters: 10.61 },
    { id: 'r2b_bath', name: 'Bathroom', floorLevel: 0, points: [{ x: -550, y: -25 }, { x: -350, y: -25 }, { x: -350, y: 214 }, { x: -550, y: 214 }], floorColor: '#5eead4', areaSquareMeters: 4.83 },
    { id: 'r2b_corr', name: 'Corridor', floorLevel: 0, points: [{ x: -350, y: -1 }, { x: 183, y: -1 }, { x: 183, y: 234 }, { x: -176, y: 234 }, { x: -176, y: 214 }, { x: -350, y: 214 }], floorColor: '#cbd5e1', areaSquareMeters: 9.98 },
    { id: 'r2b_bed1', name: 'Bedroom #1', floorLevel: 0, points: [{ x: -550, y: 214 }, { x: -176, y: 214 }, { x: -176, y: 549 }, { x: -550, y: 549 }], floorColor: '#94a3b8', areaSquareMeters: 10.91 },
  ],
  dimensionLines: [
    { id: 'dim_top_1', xStart: -550, yStart: -270, xEnd: -86, yEnd: -270, offset: 20, text: '464' },
    { id: 'dim_top_2', xStart: -86, yStart: -270, xEnd: 183, yEnd: -270, offset: 20, text: '325' },
    { id: 'dim_top_3', xStart: 183, yStart: -270, xEnd: 550, yEnd: -270, offset: 20, text: '325' },
    { id: 'dim_right', xStart: 575, yStart: -240, xEnd: 575, yEnd: 234, offset: 20, text: '474' },
    { id: 'dim_liv_bot', xStart: 183, yStart: 255, xEnd: 550, yEnd: 255, offset: 20, text: '367' },
    { id: 'dim_bed1_bot', xStart: -550, yStart: 570, xEnd: -176, yEnd: 570, offset: 20, text: '374' },
    { id: 'dim_l_1', xStart: -575, yStart: -240, xEnd: -575, yEnd: -1, offset: 20, text: '239' },
    { id: 'dim_l_2', xStart: -575, yStart: -1, xEnd: -575, yEnd: 214, offset: 20, text: '215' },
    { id: 'dim_l_3', xStart: -575, yStart: 214, xEnd: -575, yEnd: 549, offset: 20, text: '315' },
  ],
  textNotes: [
    { id: 'note_title', text: 'Two bedroom apartment', x: 0, y: 180, color: '#dc2626', fontSize: 18 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 18, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 5. 3-BEDROOM APARTMENT (Grand Family Suite with 3 Bedrooms, 2 Baths, Banquet)
// ============================================================================
export const threeBedroomAptPlan: HomePlan = {
  id: 'demo-3-bedroom-apt',
  name: '3-Bedroom apartment',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    // Outer perimeter walls (10m x 7m)
    { id: 'w3b_1', xStart: -500, yStart: -320, xEnd: 500, yEnd: -320, thickness: 18, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w3b_2', xStart: 500, yStart: -320, xEnd: 500, yEnd: 320, thickness: 18, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w3b_3', xStart: 500, yStart: 320, xEnd: -500, yEnd: 320, thickness: 18, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'w3b_4', xStart: -500, yStart: 320, xEnd: -500, yEnd: -320, thickness: 18, height: 260, color: '#f8fafc', floorLevel: 0 },

    // Interior dividing walls
    // Vertical spine separating Living Room (Left) from Bedrooms & Services (Right)
    { id: 'w3b_sp1', xStart: -40, yStart: -320, xEnd: -40, yEnd: 320, thickness: 15, height: 260, color: '#f1f5f9', floorLevel: 0 },
    // Horizontal divider for Master Suite (Top-Right)
    { id: 'w3b_sp2', xStart: -40, yStart: -110, xEnd: 500, yEnd: -110, thickness: 14, height: 260, color: '#f1f5f9', floorLevel: 0 },
    // Horizontal divider between Bedroom 2 and Bedroom 3 (Bottom-Right)
    { id: 'w3b_sp3', xStart: 180, yStart: 110, xEnd: 500, yEnd: 110, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
    // Vertical partition separating Corridor/Baths from East Bedrooms
    { id: 'w3b_sp4', xStart: 180, yStart: -110, xEnd: 180, yEnd: 320, thickness: 14, height: 260, color: '#f1f5f9', floorLevel: 0 },
    // Horizontal partition dividing Kitchen & Family Bath
    { id: 'w3b_sp5', xStart: -40, yStart: 110, xEnd: 180, yEnd: 110, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
  ],
  furniture: [
    // Doors connecting all rooms
    { id: 'f3b_d_front', catalogId: 'doorModernFlush', name: 'Main Residence Front Door', category: 'Doors & Windows', x: -270, y: 320, elevation: 0, angle: 0, width: 100, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f3b_d_liv_fr', catalogId: 'doorGlassFrench', name: 'French Terrace Double Doors', category: 'Doors & Windows', x: -270, y: -320, elevation: 0, angle: 0, width: 140, depth: 12, height: 215, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_d_bed1', catalogId: 'doorModernFlush', name: 'Master Suite Door', category: 'Doors & Windows', x: -40, y: -210, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_d_kit', catalogId: 'doorModernFlush', name: 'Kitchen Door', category: 'Doors & Windows', x: -40, y: 0, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_d_bath', catalogId: 'doorModernFlush', name: 'Family Spa Bath Door', category: 'Doors & Windows', x: -40, y: 215, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_d_bed2', catalogId: 'doorModernFlush', name: 'Bedroom #2 Door', category: 'Doors & Windows', x: 180, y: 0, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_d_bed3', catalogId: 'doorModernFlush', name: 'Bedroom #3 Door', category: 'Doors & Windows', x: 180, y: 215, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Windows with natural outdoor daylight
    { id: 'f3b_w_liv_w', catalogId: 'windowPanoramic', name: 'Living Room West Panoramic Window', category: 'Doors & Windows', x: -500, y: -60, elevation: 80, angle: Math.PI / 2, width: 180, depth: 15, height: 140, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_b1_e', catalogId: 'windowModernSliding', name: 'Master Bedroom East Window', category: 'Doors & Windows', x: 500, y: -215, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_b1_n', catalogId: 'windowModernSliding', name: 'Master Bedroom North Window', category: 'Doors & Windows', x: 230, y: -320, elevation: 90, angle: 0, width: 130, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_b2_e', catalogId: 'windowModernSliding', name: 'Bedroom #2 Window', category: 'Doors & Windows', x: 500, y: 0, elevation: 90, angle: Math.PI / 2, width: 130, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_b3_e', catalogId: 'windowModernSliding', name: 'Bedroom #3 Window East', category: 'Doors & Windows', x: 500, y: 215, elevation: 90, angle: Math.PI / 2, width: 130, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_b3_s', catalogId: 'windowModernSliding', name: 'Bedroom #3 Window South', category: 'Doors & Windows', x: 340, y: 320, elevation: 90, angle: 0, width: 120, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_w_bath', catalogId: 'windowModernSliding', name: 'Spa Bath Frosted Window', category: 'Doors & Windows', x: 70, y: 320, elevation: 110, angle: 0, width: 80, depth: 15, height: 80, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Grand Living & Dining Salon (Left Wing)
    { id: 'f3b_sofa', catalogId: 'sofa', name: 'Royal Sectional Corner Sofa', category: 'Living', x: -320, y: -160, elevation: 0, angle: 0, width: 220, depth: 150, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'f3b_ct', catalogId: 'roundTable', name: 'Solid Walnut Coffee Table', category: 'Living', x: -300, y: -70, elevation: 0, angle: 0, width: 90, depth: 90, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f3b_rug', catalogId: 'bathmat', name: 'Grand Persian Area Rug', category: 'Living', x: -300, y: -80, elevation: 1, angle: 0, width: 240, depth: 180, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0f766e', floorLevel: 0 },
    { id: 'f3b_arm1', catalogId: 'armchair', name: 'Emerald Velvet Armchair', category: 'Living', x: -170, y: -70, elevation: 0, angle: -Math.PI / 2, width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 0 },
    { id: 'f3b_tv', catalogId: 'tvUnit', name: '85" 4K Smart Media Wall', category: 'Living', x: -470, y: 100, elevation: 0, angle: Math.PI / 2, width: 180, depth: 45, height: 55, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f3b_fp', catalogId: 'fireplace', name: 'Contemporary Electric Fireplace', category: 'Living', x: -100, y: -20, elevation: 0, angle: -Math.PI / 2, width: 120, depth: 35, height: 95, model: 'procedural:wallDesign:{"type":"brick_cladding"}', icon: '/models/tvUnit.png', color: '#18181b', floorLevel: 0 },
    { id: 'f3b_plant1', catalogId: 'plant', name: 'Tall Fiddle Fig', category: 'Living', x: -460, y: -280, elevation: 0, angle: 0, width: 60, depth: 60, height: 140, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },
    { id: 'f3b_chand_liv', catalogId: 'chandelier', name: 'Crystal Dining & Salon Chandelier', category: 'Lighting', x: -280, y: -50, elevation: 220, angle: 0, width: 70, depth: 70, height: 65, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":70,"shadeHeight":50,"totalHeight":65}', icon: '/models/pendantLamp.png', color: '#fde047', floorLevel: 0, placementType: 'ceiling' },

    // Formal Banquet Dining Suite
    { id: 'f3b_dtable', catalogId: 'squareTable', name: '6-Seater Formal Dining Table', category: 'Living', x: -260, y: 170, elevation: 0, angle: 0, width: 180, depth: 95, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'f3b_ch1', catalogId: 'chair', name: 'Dining Chair 1', category: 'Living', x: -310, y: 115, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f3b_ch2', catalogId: 'chair', name: 'Dining Chair 2', category: 'Living', x: -260, y: 115, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f3b_ch3', catalogId: 'chair', name: 'Dining Chair 3', category: 'Living', x: -210, y: 115, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f3b_ch4', catalogId: 'chair', name: 'Dining Chair 4', category: 'Living', x: -310, y: 225, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f3b_ch5', catalogId: 'chair', name: 'Dining Chair 5', category: 'Living', x: -260, y: 225, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'f3b_ch6', catalogId: 'chair', name: 'Dining Chair 6', category: 'Living', x: -210, y: 225, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },

    // Family Gourmet Kitchen (Center)
    { id: 'f3b_ksink', catalogId: 'kitchenCabinet', name: 'Double Sink & Island Run', category: 'Kitchen', x: 20, y: -70, elevation: 0, angle: 0, width: 110, depth: 60, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#f8fafc', floorLevel: 0 },
    { id: 'f3b_kcook', catalogId: 'cooker', name: 'Gourmet 5-Burner Cooktop', category: 'Kitchen', x: 100, y: -70, elevation: 0, angle: 0, width: 60, depth: 60, height: 85, model: '/models/cooker.obj', icon: '/models/cooker.png', color: '#1e293b', floorLevel: 0 },
    { id: 'f3b_kfridge', catalogId: 'refrigerator', name: 'French-Door Refrigerator', category: 'Kitchen', x: 145, y: 40, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 75, height: 185, model: 'procedural:cabinet:{"columns":2,"rows":2,"doorType":"solid_doors","hasLegs":false}', icon: '/models/kitchenCabinet.png', color: '#cbd5e1', floorLevel: 0 },
    { id: 'f3b_kpend', catalogId: 'pendantLamp', name: 'Kitchen Task Pendant', category: 'Lighting', x: 70, y: 0, elevation: 220, angle: 0, width: 35, depth: 35, height: 35, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":30,"shadeHeight":18,"totalHeight":35}', icon: '/models/pendantLamp.png', color: '#38bdf8', floorLevel: 0, placementType: 'ceiling' },

    // Master Bedroom Suite (Top-Right)
    { id: 'f3b_b1_bed', catalogId: 'bed140x190', name: 'King Tufted Master Bed', category: 'Bedroom', x: 340, y: -215, elevation: 0, angle: 0, width: 180, depth: 205, height: 95, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#818cf8', floorLevel: 0 },
    { id: 'f3b_b1_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: 225, y: -215, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f3b_b1_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: 455, y: -215, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f3b_b1_l1', catalogId: 'tableLamp', name: 'Bedside Lamp 1', category: 'Lighting', x: 225, y: -215, elevation: 50, angle: 0, width: 22, depth: 22, height: 38, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f3b_b1_l2', catalogId: 'tableLamp', name: 'Bedside Lamp 2', category: 'Lighting', x: 455, y: -215, elevation: 50, angle: 0, width: 22, depth: 22, height: 38, model: 'procedural:lamp:{"type":"table_lamp","shadeWidth":18,"shadeHeight":15,"totalHeight":38}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'tabletop', placeOnTable: true },
    { id: 'f3b_b1_ward', catalogId: 'wardrobe', name: '4-Door Walk-In Wardrobe', category: 'Bedroom', x: 100, y: -150, elevation: 0, angle: Math.PI / 2, width: 180, depth: 60, height: 215, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Bedroom #2 (Guest / Study Suite - Middle Right)
    { id: 'f3b_b2_bed', catalogId: 'bed140x190', name: 'Guest Double Bed', category: 'Bedroom', x: 340, y: 0, elevation: 0, angle: 0, width: 150, depth: 200, height: 85, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#34d399', floorLevel: 0 },
    { id: 'f3b_b2_ward', catalogId: 'wardrobe', name: 'Guest Wardrobe Closet', category: 'Bedroom', x: 460, y: 60, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 55, height: 195, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#334155', floorLevel: 0 },
    { id: 'f3b_b2_desk', catalogId: 'squareTable', name: 'Study Writing Desk', category: 'Bedroom', x: 235, y: 60, elevation: 0, angle: 0, width: 100, depth: 55, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'f3b_b2_ch', catalogId: 'chair', name: 'Study Chair', category: 'Bedroom', x: 235, y: 15, elevation: 0, angle: 0, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#059669', floorLevel: 0 },

    // Bedroom #3 (Kids Suite - Bottom Right)
    { id: 'f3b_b3_bed', catalogId: 'bunkBed90x190', name: 'Kids Dual Bunk Bed', category: 'Bedroom', x: 340, y: 215, elevation: 0, angle: 0, width: 105, depth: 200, height: 165, model: '/models/bunkBed90x190.obj', icon: '/models/bunkBed90x190.png', color: '#fbbf24', floorLevel: 0 },
    { id: 'f3b_b3_bookc', catalogId: 'bookcase', name: 'Toy & Book Shelf', category: 'Bedroom', x: 460, y: 275, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 35, height: 175, model: '/models/bookcase.obj', icon: '/models/bookcase.png', color: '#d97706', floorLevel: 0 },
    { id: 'f3b_b3_rug', catalogId: 'bathmat', name: 'Play Rug', category: 'Bedroom', x: 250, y: 215, elevation: 1, angle: 0, width: 110, depth: 110, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#f59e0b', floorLevel: 0 },

    // Family Spa Bathroom (Bottom-Center)
    { id: 'f3b_bath', catalogId: 'bath', name: 'Deep Soaking Spa Bath', category: 'Bathroom', x: 70, y: 180, elevation: 0, angle: 0, width: 150, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_wash', catalogId: 'washbasin', name: 'Vanity Washbasin', category: 'Bathroom', x: 10, y: 260, elevation: 0, angle: 0, width: 75, depth: 50, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_wc', catalogId: 'toiletUnit', name: 'Modern Toilet Suite', category: 'Bathroom', x: 130, y: 260, elevation: 0, angle: 0, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'f3b_bmat', catalogId: 'bathmat', name: 'Plush Bath Mat', category: 'Bathroom', x: 70, y: 230, elevation: 1, angle: 0, width: 75, depth: 45, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0284c7', floorLevel: 0 },
    { id: 'f3b_rad', catalogId: 'radiator', name: 'Heated Towel Radiator', category: 'Bathroom', x: 175, y: 180, elevation: 30, angle: -Math.PI / 2, width: 55, depth: 10, height: 75, model: 'procedural:decor:{"type":"wall_art"}', icon: '/models/tvUnit.png', color: '#ffffff', floorLevel: 0, placementType: 'wall' },
  ],
  rooms: [
    { id: 'r3b_liv', name: 'Central Living & Dining', floorLevel: 0, points: [{ x: -500, y: -320 }, { x: -40, y: -320 }, { x: -40, y: 320 }, { x: -500, y: 320 }], floorColor: '#334155', areaSquareMeters: 29.4 },
    { id: 'r3b_b1', name: 'Master Suite', floorLevel: 0, points: [{ x: -40, y: -320 }, { x: 500, y: -320 }, { x: 500, y: -110 }, { x: -40, y: -110 }], floorColor: '#c7d2fe', areaSquareMeters: 11.3 },
    { id: 'r3b_kit', name: 'Gourmet Kitchen', floorLevel: 0, points: [{ x: -40, y: -110 }, { x: 180, y: -110 }, { x: 180, y: 110 }, { x: -40, y: 110 }], floorColor: '#38bdf8', areaSquareMeters: 4.8 },
    { id: 'r3b_b2', name: 'Bedroom #2 (Guest Suite)', floorLevel: 0, points: [{ x: 180, y: -110 }, { x: 500, y: -110 }, { x: 500, y: 110 }, { x: 180, y: 110 }], floorColor: '#a7f3d0', areaSquareMeters: 7.0 },
    { id: 'r3b_b3', name: 'Bedroom #3 (Kids Suite)', floorLevel: 0, points: [{ x: 180, y: 110 }, { x: 500, y: 110 }, { x: 500, y: 320 }, { x: 180, y: 320 }], floorColor: '#fef3c7', areaSquareMeters: 6.7 },
    { id: 'r3b_bath', name: 'Spa Bathroom', floorLevel: 0, points: [{ x: -40, y: 110 }, { x: 180, y: 110 }, { x: 180, y: 320 }, { x: -40, y: 320 }], floorColor: '#5eead4', areaSquareMeters: 4.6 },
  ],
  dimensionLines: [
    { id: 'dim_3b_w', xStart: -500, yStart: -345, xEnd: 500, yEnd: -345, offset: 20, text: '1000' },
    { id: 'dim_3b_h', xStart: 525, yStart: -320, xEnd: 525, yEnd: 320, offset: 20, text: '640' },
  ],
  textNotes: [
    { id: 'n3b_title', text: '3-Bedroom apartment', x: -270, y: 280, color: '#dc2626', fontSize: 17 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 18, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 6. APARTMENT WITH BOW WINDOW (Architectural Faceted Bay / Salon & Fireplace)
// ============================================================================
export const bowWindowAptPlan: HomePlan = {
  id: 'demo-bow-window-apt',
  name: 'Apartment with bow window',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor', elevation: 0, height: 260 },
  ],
  walls: [
    // Faceted Bow Window Bay at Front-Left (Characteristic angled parlor walls)
    { id: 'wbw_1', xStart: -350, yStart: -120, xEnd: -430, yEnd: -40, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_2', xStart: -430, yStart: -40, xEnd: -430, yEnd: 40, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_3', xStart: -430, yStart: 40, xEnd: -350, yEnd: 120, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    // Outer perimeter walls
    { id: 'wbw_4', xStart: -350, yStart: 120, xEnd: -350, yEnd: 270, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_5', xStart: -350, yStart: 270, xEnd: 380, yEnd: 270, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_6', xStart: 380, yStart: 270, xEnd: 380, yEnd: -270, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_7', xStart: 380, yStart: -270, xEnd: -350, yEnd: -270, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wbw_8', xStart: -350, yStart: -270, xEnd: -350, yEnd: -120, thickness: 16, height: 260, color: '#f8fafc', floorLevel: 0 },
    // Interior dividing walls (Bedroom and Bathroom)
    { id: 'wbw_p1', xStart: 60, yStart: -270, xEnd: 60, yEnd: 270, thickness: 14, height: 260, color: '#f1f5f9', floorLevel: 0 },
    { id: 'wbw_p2', xStart: 60, yStart: 80, xEnd: 380, yEnd: 80, thickness: 12, height: 260, color: '#f1f5f9', floorLevel: 0 },
  ],
  furniture: [
    // Doors connecting rooms
    { id: 'fbw_d_front', catalogId: 'doorModernFlush', name: 'Main Entry Door', category: 'Doors & Windows', x: -160, y: 270, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fbw_d_bed', catalogId: 'doorModernFlush', name: 'Master Suite Door', category: 'Doors & Windows', x: 60, y: -70, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_d_bath', catalogId: 'doorModernFlush', name: 'Bathroom Door', category: 'Doors & Windows', x: 60, y: 175, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Faceted Bay / Bow Windows (3 panoramic facets)
    { id: 'fbw_w_facet1', catalogId: 'windowPanoramic', name: 'Bow Window North Flank', category: 'Doors & Windows', x: -390, y: -80, elevation: 80, angle: Math.PI / 4, width: 100, depth: 15, height: 140, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_w_facet2', catalogId: 'windowPanoramic', name: 'Bow Window Center Panoramic', category: 'Doors & Windows', x: -430, y: 0, elevation: 80, angle: Math.PI / 2, width: 100, depth: 15, height: 140, model: 'procedural:window:{"type":"picture_panoramic"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_w_facet3', catalogId: 'windowPanoramic', name: 'Bow Window South Flank', category: 'Doors & Windows', x: -390, y: 80, elevation: 80, angle: -Math.PI / 4, width: 100, depth: 15, height: 140, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_w_bed', catalogId: 'windowModernSliding', name: 'Bedroom East Window', category: 'Doors & Windows', x: 380, y: -100, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_w_bath', catalogId: 'windowModernSliding', name: 'Bathroom Window', category: 'Doors & Windows', x: 380, y: 175, elevation: 110, angle: Math.PI / 2, width: 80, depth: 15, height: 80, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Bow Window Alcove Reading Nook
    { id: 'fbw_arm1', catalogId: 'armchair', name: 'Bay Reading Armchair North', category: 'Living', x: -370, y: -40, elevation: 0, angle: -Math.PI / 3, width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 0 },
    { id: 'fbw_arm2', catalogId: 'armchair', name: 'Bay Reading Armchair South', category: 'Living', x: -370, y: 40, elevation: 0, angle: -2 * Math.PI / 3, width: 85, depth: 85, height: 80, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 0 },
    { id: 'fbw_roundt', catalogId: 'roundTable', name: 'Bay Parlor Side Table', category: 'Living', x: -340, y: 0, elevation: 0, angle: 0, width: 55, depth: 55, height: 50, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },

    // Grand Salon with Fireplace & Sofa
    { id: 'fbw_sofa', catalogId: 'sofa', name: 'Bay Lounge Sofa', category: 'Living', x: -170, y: -110, elevation: 0, angle: 0, width: 220, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#b45309', floorLevel: 0 },
    { id: 'fbw_ctable', catalogId: 'roundTable', name: 'Salon Coffee Table', category: 'Living', x: -170, y: -15, elevation: 0, angle: 0, width: 85, depth: 85, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'fbw_rug', catalogId: 'bathmat', name: 'Salon Plush Rug', category: 'Living', x: -170, y: -20, elevation: 1, angle: 0, width: 200, depth: 150, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#92400e', floorLevel: 0 },
    { id: 'fbw_tv', catalogId: 'tvUnit', name: 'Media Console', category: 'Living', x: -170, y: 90, elevation: 0, angle: Math.PI, width: 160, depth: 45, height: 52, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fbw_fp', catalogId: 'fireplace', name: 'Hearth Fireplace', category: 'Living', x: 45, y: -10, elevation: 0, angle: -Math.PI / 2, width: 120, depth: 35, height: 95, model: 'procedural:wallDesign:{"type":"brick_cladding"}', icon: '/models/tvUnit.png', color: '#18181b', floorLevel: 0 },
    { id: 'fbw_plant', catalogId: 'plant', name: 'Fiddle Fig', category: 'Living', x: -300, y: 220, elevation: 0, angle: 0, width: 50, depth: 50, height: 130, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },
    { id: 'fbw_chand', catalogId: 'chandelier', name: 'Salon Chandelier', category: 'Lighting', x: -170, y: -20, elevation: 220, angle: 0, width: 60, depth: 60, height: 60, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":60,"shadeHeight":45,"totalHeight":60}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'ceiling' },

    // Dining Nook
    { id: 'fbw_dtable', catalogId: 'squareTable', name: 'Dining Table', category: 'Living', x: -40, y: 170, elevation: 0, angle: 0, width: 120, depth: 80, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'fbw_dch1', catalogId: 'chair', name: 'Dining Chair 1', category: 'Living', x: -40, y: 120, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'fbw_dch2', catalogId: 'chair', name: 'Dining Chair 2', category: 'Living', x: -40, y: 220, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },

    // Master Bedroom Suite
    { id: 'fbw_bed', catalogId: 'bed140x190', name: 'Master Tufted Bed', category: 'Bedroom', x: 230, y: -120, elevation: 0, angle: 0, width: 160, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#f43f5e', floorLevel: 0 },
    { id: 'fbw_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: 120, y: -120, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fbw_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: 340, y: -120, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fbw_ward', catalogId: 'wardrobe', name: 'Master Wardrobe Closet', category: 'Bedroom', x: 230, y: 20, elevation: 0, angle: 0, width: 150, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Bathroom Suite
    { id: 'fbw_bath', catalogId: 'bath', name: 'Full Soaking Bathtub', category: 'Bathroom', x: 230, y: 210, elevation: 0, angle: 0, width: 160, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_wash', catalogId: 'washbasin', name: 'Vanity Washbasin', category: 'Bathroom', x: 115, y: 210, elevation: 0, angle: Math.PI / 2, width: 70, depth: 50, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_wc', catalogId: 'toiletUnit', name: 'Porcelain Toilet', category: 'Bathroom', x: 115, y: 130, elevation: 0, angle: Math.PI / 2, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fbw_bmat', catalogId: 'bathmat', name: 'Plush Bath Mat', category: 'Bathroom', x: 230, y: 145, elevation: 1, angle: 0, width: 70, depth: 45, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0ea5e9', floorLevel: 0 },
  ],
  rooms: [
    {
      id: 'rbw_1',
      name: 'Bow Window Living Salon',
      floorLevel: 0,
      points: [
        { x: -350, y: -270 },
        { x: 60, y: -270 },
        { x: 60, y: 270 },
        { x: -350, y: 270 },
        { x: -350, y: 120 },
        { x: -430, y: 40 },
        { x: -430, y: -40 },
        { x: -350, y: -120 },
      ],
      floorColor: '#b45309', // Classic honey teak parquet
      areaSquareMeters: 26.5,
    },
    {
      id: 'rbw_bed',
      name: 'Master Suite',
      floorLevel: 0,
      points: [{ x: 60, y: -270 }, { x: 380, y: -270 }, { x: 380, y: 80 }, { x: 60, y: 80 }],
      floorColor: '#fbcfe8',
      areaSquareMeters: 11.2,
    },
    {
      id: 'rbw_bath',
      name: 'Bathroom',
      floorLevel: 0,
      points: [{ x: 60, y: 80 }, { x: 380, y: 80 }, { x: 380, y: 270 }, { x: 60, y: 270 }],
      floorColor: '#0284c7',
      areaSquareMeters: 6.1,
    },
  ],
  dimensionLines: [
    { id: 'dim_bw_w', xStart: -350, yStart: -295, xEnd: 380, yEnd: -295, offset: 20, text: '730' },
    { id: 'dim_bw_h', xStart: 405, yStart: -270, xEnd: 405, yEnd: 270, offset: 20, text: '540' },
  ],
  textNotes: [
    { id: 'nbw_title', text: 'Apartment with bow window', x: -160, y: 230, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 16, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 7. 2-BEDROOM HOUSE WITH BASEMENT (Multi-Story Villa: Ground Living + Basement)
// ============================================================================
export const houseWithBasementPlan: HomePlan = {
  id: 'demo-house-basement',
  name: '2-Bedroom house with basement',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: -1, name: 'Basement Storage & Workshop', elevation: -260, height: 260 },
    { level: 0, name: 'Ground Floor Residence', elevation: 0, height: 260 },
  ],
  walls: [
    // Ground Floor Perimeter (8m x 6m)
    { id: 'whb_1', xStart: -400, yStart: -280, xEnd: 400, yEnd: -280, thickness: 20, height: 260, color: '#fef3c7', floorLevel: 0 },
    { id: 'whb_2', xStart: 400, yStart: -280, xEnd: 400, yEnd: 280, thickness: 20, height: 260, color: '#fef3c7', floorLevel: 0 },
    { id: 'whb_3', xStart: 400, yStart: 280, xEnd: -400, yEnd: 280, thickness: 20, height: 260, color: '#fef3c7', floorLevel: 0 },
    { id: 'whb_4', xStart: -400, yStart: 280, xEnd: -400, yEnd: -280, thickness: 20, height: 260, color: '#fef3c7', floorLevel: 0 },
    // Ground Floor Interior Partitions
    { id: 'whb_p1', xStart: 20, yStart: -280, xEnd: 20, yEnd: 280, thickness: 15, height: 260, color: '#fef3c7', floorLevel: 0 },
    { id: 'whb_p2', xStart: 20, yStart: 20, xEnd: 400, yEnd: 20, thickness: 12, height: 260, color: '#fef3c7', floorLevel: 0 },

    // Basement Concrete Retaining Walls (Level -1)
    { id: 'whb_b1', xStart: -400, yStart: -280, xEnd: 400, yEnd: -280, thickness: 25, height: 260, color: '#94a3b8', floorLevel: -1 },
    { id: 'whb_b2', xStart: 400, yStart: -280, xEnd: 400, yEnd: 280, thickness: 25, height: 260, color: '#94a3b8', floorLevel: -1 },
    { id: 'whb_b3', xStart: 400, yStart: 280, xEnd: -400, yEnd: 280, thickness: 25, height: 260, color: '#94a3b8', floorLevel: -1 },
    { id: 'whb_b4', xStart: -400, yStart: 280, xEnd: -400, yEnd: -280, thickness: 25, height: 260, color: '#94a3b8', floorLevel: -1 },
    { id: 'whb_bp1', xStart: 0, yStart: -280, xEnd: 0, yEnd: 280, thickness: 20, height: 260, color: '#94a3b8', floorLevel: -1 },
  ],
  furniture: [
    // --- GROUND FLOOR ITEMS (Floor Level 0) ---
    // Entrance Front Door & French Garden Door
    { id: 'fhb_d_front', catalogId: 'doorModernFlush', name: 'Front Porch Entrance Door', category: 'Doors & Windows', x: -200, y: 280, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fhb_d_terrace', catalogId: 'doorGlassFrench', name: 'French Terrace Patio Doors', category: 'Doors & Windows', x: -200, y: -280, elevation: 0, angle: 0, width: 140, depth: 12, height: 215, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fhb_d_bed1', catalogId: 'doorModernFlush', name: 'Master Bedroom Door', category: 'Doors & Windows', x: 20, y: -120, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fhb_d_bed2', catalogId: 'doorModernFlush', name: 'Guest Bedroom Door', category: 'Doors & Windows', x: 20, y: 150, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Windows
    { id: 'fhb_w_liv_w', catalogId: 'windowModernSliding', name: 'Living Room West Window', category: 'Doors & Windows', x: -400, y: 0, elevation: 90, angle: Math.PI / 2, width: 150, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fhb_w_b1_e', catalogId: 'windowModernSliding', name: 'Master Bedroom Window', category: 'Doors & Windows', x: 400, y: -130, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fhb_w_b2_e', catalogId: 'windowModernSliding', name: 'Guest Bedroom Window', category: 'Doors & Windows', x: 400, y: 150, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Living Room & Fireplace
    { id: 'fhb_sofa', catalogId: 'sofa', name: 'Terrace Living Sofa', category: 'Living', x: -220, y: -120, elevation: 0, angle: 0, width: 220, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#15803d', floorLevel: 0 },
    { id: 'fhb_ct', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: -220, y: -25, elevation: 0, angle: 0, width: 85, depth: 85, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fhb_rug', catalogId: 'bathmat', name: 'Warm Living Rug', category: 'Living', x: -220, y: -30, elevation: 1, angle: 0, width: 190, depth: 150, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#854d0e', floorLevel: 0 },
    { id: 'fhb_tv', catalogId: 'tvUnit', name: 'TV Media Console', category: 'Living', x: -220, y: 80, elevation: 0, angle: Math.PI, width: 160, depth: 45, height: 50, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fhb_fp', catalogId: 'fireplace', name: 'Hearth Wood Fireplace', category: 'Living', x: 10, y: -60, elevation: 0, angle: -Math.PI / 2, width: 120, depth: 35, height: 95, model: 'procedural:wallDesign:{"type":"brick_cladding"}', icon: '/models/tvUnit.png', color: '#18181b', floorLevel: 0 },

    // Dining Suite
    { id: 'fhb_dt', catalogId: 'squareTable', name: 'Country Dining Table', category: 'Living', x: -70, y: 180, elevation: 0, angle: 0, width: 130, depth: 85, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'fhb_ch1', catalogId: 'chair', name: 'Dining Chair 1', category: 'Living', x: -70, y: 130, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'fhb_ch2', catalogId: 'chair', name: 'Dining Chair 2', category: 'Living', x: -70, y: 230, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },

    // Master Bedroom (Top-Right)
    { id: 'fhb_b1_bed', catalogId: 'bed140x190', name: 'Master Suite Bed', category: 'Bedroom', x: 220, y: -130, elevation: 0, angle: 0, width: 160, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#dc2626', floorLevel: 0 },
    { id: 'fhb_b1_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: 110, y: -130, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fhb_b1_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: 330, y: -130, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fhb_b1_ward', catalogId: 'wardrobe', name: 'Master Wardrobe', category: 'Bedroom', x: 220, y: -20, elevation: 0, angle: 0, width: 140, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Bedroom #2 (Bottom-Right)
    { id: 'fhb_b2_bed', catalogId: 'bed90x190', name: 'Guest Single Bed', category: 'Bedroom', x: 220, y: 150, elevation: 0, angle: 0, width: 100, depth: 190, height: 85, model: '/models/bed90x190.obj', icon: '/models/bed90x190.png', color: '#3b82f6', floorLevel: 0 },
    { id: 'fhb_b2_ward', catalogId: 'wardrobe', name: 'Wardrobe Closet', category: 'Bedroom', x: 340, y: 220, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 55, height: 195, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#334155', floorLevel: 0 },
    { id: 'fhb_b2_desk', catalogId: 'squareTable', name: 'Study Desk', category: 'Bedroom', x: 110, y: 220, elevation: 0, angle: 0, width: 95, depth: 55, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#78350f', floorLevel: 0 },

    // Outdoor Garden Features
    { id: 'fhb_grill', catalogId: 'grillBbq', name: 'Garden BBQ Grill', category: 'Garden', x: -350, y: -240, elevation: 0, angle: 0, width: 75, depth: 55, height: 95, model: 'procedural:outdoor:{"type":"grill_bbq"}', icon: '/models/roundTable.png', color: '#18181b', floorLevel: 0 },
    { id: 'fhb_deckch', catalogId: 'deckChair', name: 'Patio Sun Lounger', category: 'Garden', x: -280, y: -240, elevation: 0, angle: 0, width: 65, depth: 150, height: 70, model: 'procedural:outdoor:{"type":"deck_chair"}', icon: '/models/chair.png', color: '#0284c7', floorLevel: 0 },

    // --- BASEMENT ITEMS (Floor Level -1) ---
    { id: 'fhb_b_d', catalogId: 'doorBarnSliding', name: 'Basement Vault Security Door', category: 'Doors & Windows', x: 0, y: 0, elevation: 0, angle: Math.PI / 2, width: 95, depth: 10, height: 215, model: 'procedural:door:{"type":"barn_sliding"}', icon: '/models/door.png', color: '#78350f', floorLevel: -1 },
    { id: 'fhb_b_shelf1', catalogId: 'bookcase', name: 'Basement Heavy Storage Shelves', category: 'Living', x: -360, y: -100, elevation: 0, angle: Math.PI / 2, width: 120, depth: 45, height: 210, model: '/models/bookcase.obj', icon: '/models/bookcase.png', color: '#334155', floorLevel: -1 },
    { id: 'fhb_b_shelf2', catalogId: 'bookcase', name: 'Basement Storage Shelves 2', category: 'Living', x: -360, y: 100, elevation: 0, angle: Math.PI / 2, width: 120, depth: 45, height: 210, model: '/models/bookcase.obj', icon: '/models/bookcase.png', color: '#334155', floorLevel: -1 },
    { id: 'fhb_b_worktable', catalogId: 'squareTable', name: 'Workshop Heavy Craft Bench', category: 'Living', x: -180, y: 0, elevation: 0, angle: 0, width: 180, depth: 90, height: 85, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#475569', floorLevel: -1 },
    { id: 'fhb_b_sofa', catalogId: 'sofa', name: 'Basement Game Den Sofa', category: 'Living', x: 200, y: 0, elevation: 0, angle: 0, width: 200, depth: 85, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#475569', floorLevel: -1 },
    { id: 'fhb_b_light', catalogId: 'pendantLamp', name: 'Industrial Workshop Light', category: 'Lighting', x: -180, y: 0, elevation: 220, angle: 0, width: 45, depth: 45, height: 40, model: 'procedural:lamp:{"type":"pendant_dome","shadeWidth":40,"shadeHeight":25,"totalHeight":40}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: -1, placementType: 'ceiling' },
  ],
  rooms: [
    { id: 'rhb_0', name: 'Main Residence Living Salon', floorLevel: 0, points: [{ x: -400, y: -280 }, { x: 20, y: -280 }, { x: 20, y: 280 }, { x: -400, y: 280 }], floorColor: '#fde68a', areaSquareMeters: 23.5 },
    { id: 'rhb_b1', name: 'Master Bedroom', floorLevel: 0, points: [{ x: 20, y: -280 }, { x: 400, y: -280 }, { x: 400, y: 20 }, { x: 20, y: 20 }], floorColor: '#fed7aa', areaSquareMeters: 11.4 },
    { id: 'rhb_b2', name: 'Guest Bedroom', floorLevel: 0, points: [{ x: 20, y: 20 }, { x: 400, y: 20 }, { x: 400, y: 280 }, { x: 20, y: 280 }], floorColor: '#bfdbfe', areaSquareMeters: 9.8 },
    { id: 'rhb_m1', name: 'Basement Vault & Workshop', floorLevel: -1, points: [{ x: -400, y: -280 }, { x: 400, y: -280 }, { x: 400, y: 280 }, { x: -400, y: 280 }], floorColor: '#64748b', areaSquareMeters: 44.8 },
  ],
  dimensionLines: [
    { id: 'dim_hb_w', xStart: -400, yStart: -305, xEnd: 400, yEnd: -305, offset: 20, text: '800' },
    { id: 'dim_hb_h', xStart: 425, yStart: -280, xEnd: 425, yEnd: 280, offset: 20, text: '560' },
  ],
  textNotes: [
    { id: 'nhb_title', text: '2-Bedroom house with basement', x: -200, y: 240, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 20, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 8. 3-BEDROOM HOUSE WITH ATTIC (Two-Story Country House with Pitched Gable Attic)
// ============================================================================
export const houseWithAtticPlan: HomePlan = {
  id: 'demo-house-attic',
  name: '3-Bedroom house with attic',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor Living', elevation: 0, height: 260 },
    { level: 1, name: 'Attic Floor (Pitched Gable)', elevation: 260, height: 240 },
  ],
  walls: [
    // Ground floor perimeter (8m x 6m)
    { id: 'wha_1', xStart: -400, yStart: -300, xEnd: 400, yEnd: -300, thickness: 20, height: 260, color: '#ffffff', floorLevel: 0 },
    { id: 'wha_2', xStart: 400, yStart: -300, xEnd: 400, yEnd: 300, thickness: 20, height: 260, color: '#ffffff', floorLevel: 0 },
    { id: 'wha_3', xStart: 400, yStart: 300, xEnd: -400, yEnd: 300, thickness: 20, height: 260, color: '#ffffff', floorLevel: 0 },
    { id: 'wha_4', xStart: -400, yStart: 300, xEnd: -400, yEnd: -300, thickness: 20, height: 260, color: '#ffffff', floorLevel: 0 },
    // Ground floor partitions
    { id: 'wha_p1', xStart: 40, yStart: -300, xEnd: 40, yEnd: 300, thickness: 15, height: 260, color: '#f8fafc', floorLevel: 0 },
    { id: 'wha_p2', xStart: 40, yStart: 50, xEnd: 400, yEnd: 50, thickness: 12, height: 260, color: '#f8fafc', floorLevel: 0 },

    // Attic Floor (Level 1 under pitched roof)
    { id: 'wha_a1', xStart: -380, yStart: -260, xEnd: 380, yEnd: -260, thickness: 15, height: 240, color: '#f8fafc', floorLevel: 1 },
    { id: 'wha_a2', xStart: 380, yStart: -260, xEnd: 380, yEnd: 260, thickness: 15, height: 240, color: '#f8fafc', floorLevel: 1 },
    { id: 'wha_a3', xStart: 380, yStart: 260, xEnd: -380, yEnd: 260, thickness: 15, height: 240, color: '#f8fafc', floorLevel: 1 },
    { id: 'wha_a4', xStart: -380, yStart: 260, xEnd: -380, yEnd: -260, thickness: 15, height: 240, color: '#f8fafc', floorLevel: 1 },
    { id: 'wha_ap1', xStart: 0, yStart: -260, xEnd: 0, yEnd: 260, thickness: 12, height: 240, color: '#f8fafc', floorLevel: 1 },
  ],
  furniture: [
    // --- GROUND FLOOR (Level 0) ---
    // Doors
    { id: 'fha_d_front', catalogId: 'doorModernFlush', name: 'Main Entry Front Door', category: 'Doors & Windows', x: -180, y: 300, elevation: 0, angle: 0, width: 95, depth: 15, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fha_d_gbed', catalogId: 'doorModernFlush', name: 'Ground Guest Suite Door', category: 'Doors & Windows', x: 40, y: -120, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fha_d_bath', catalogId: 'doorModernFlush', name: 'Ground Bathroom Door', category: 'Doors & Windows', x: 40, y: 160, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    // Windows
    { id: 'fha_w_liv_n', catalogId: 'windowFrenchArch', name: 'French Arch Living Window', category: 'Doors & Windows', x: -180, y: -300, elevation: 70, angle: 0, width: 120, depth: 15, height: 150, model: 'procedural:window:{"type":"french_arch"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fha_w_gbed_e', catalogId: 'windowModernSliding', name: 'Guest Bedroom Window', category: 'Doors & Windows', x: 400, y: -120, elevation: 90, angle: Math.PI / 2, width: 130, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fha_w_bath', catalogId: 'windowModernSliding', name: 'Bathroom Frosted Window', category: 'Doors & Windows', x: 400, y: 160, elevation: 110, angle: Math.PI / 2, width: 80, depth: 15, height: 80, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Grand Living Room
    { id: 'fha_sofa', catalogId: 'sofa', name: 'Cottage Hearth Sofa', category: 'Living', x: -200, y: -130, elevation: 0, angle: 0, width: 220, depth: 90, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'fha_ctable', catalogId: 'roundTable', name: 'Coffee Table', category: 'Living', x: -200, y: -35, elevation: 0, angle: 0, width: 85, depth: 85, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fha_rug', catalogId: 'bathmat', name: 'Persian Living Rug', category: 'Living', x: -200, y: -40, elevation: 1, angle: 0, width: 190, depth: 150, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0f766e', floorLevel: 0 },
    { id: 'fha_tv', catalogId: 'tvUnit', name: 'Media Console', category: 'Living', x: -200, y: 70, elevation: 0, angle: Math.PI, width: 160, depth: 45, height: 50, model: '/models/tvUnit.obj', icon: '/models/tvUnit.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fha_fp', catalogId: 'fireplace', name: 'Stone Fireplace', category: 'Living', x: 30, y: -60, elevation: 0, angle: -Math.PI / 2, width: 120, depth: 35, height: 95, model: 'procedural:wallDesign:{"type":"brick_cladding"}', icon: '/models/tvUnit.png', color: '#18181b', floorLevel: 0 },

    // Dining Suite
    { id: 'fha_dt', catalogId: 'squareTable', name: 'Dining Table', category: 'Living', x: -60, y: 190, elevation: 0, angle: 0, width: 130, depth: 85, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'fha_ch1', catalogId: 'chair', name: 'Dining Chair 1', category: 'Living', x: -60, y: 140, elevation: 0, angle: 0, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'fha_ch2', catalogId: 'chair', name: 'Dining Chair 2', category: 'Living', x: -60, y: 240, elevation: 0, angle: Math.PI, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },

    // Ground Floor Bedroom 1
    { id: 'fha_g_bed', catalogId: 'bed140x190', name: 'Ground Guest Bed', category: 'Bedroom', x: 220, y: -130, elevation: 0, angle: 0, width: 150, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#059669', floorLevel: 0 },
    { id: 'fha_g_ns', catalogId: 'bedsideTable', name: 'Nightstand', category: 'Bedroom', x: 110, y: -130, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fha_g_ward', catalogId: 'wardrobe', name: 'Wardrobe Closet', category: 'Bedroom', x: 220, y: 0, elevation: 0, angle: 0, width: 130, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Ground Floor Bathroom
    { id: 'fha_g_bath', catalogId: 'bath', name: 'Full Bathtub', category: 'Bathroom', x: 220, y: 220, elevation: 0, angle: 0, width: 150, depth: 75, height: 55, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fha_g_wash', catalogId: 'washbasin', name: 'Vanity Washbasin', category: 'Bathroom', x: 110, y: 220, elevation: 0, angle: Math.PI / 2, width: 65, depth: 48, height: 85, model: 'procedural:cabinet:{"columns":1,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fha_g_wc', catalogId: 'toiletUnit', name: 'Toilet Suite', category: 'Bathroom', x: 110, y: 130, elevation: 0, angle: Math.PI / 2, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 0 },

    // --- ATTIC FLOOR (Level 1) ---
    { id: 'fha_attic_d', catalogId: 'doorModernFlush', name: 'Attic Master Door', category: 'Doors & Windows', x: 0, y: 0, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fha_attic_win1', catalogId: 'windowFrenchArch', name: 'Attic Gable Skylight West', category: 'Doors & Windows', x: -380, y: 0, elevation: 90, angle: Math.PI / 2, width: 100, depth: 15, height: 110, model: 'procedural:window:{"type":"french_arch"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fha_attic_win2', catalogId: 'windowFrenchArch', name: 'Attic Gable Skylight East', category: 'Doors & Windows', x: 380, y: 0, elevation: 90, angle: Math.PI / 2, width: 100, depth: 15, height: 110, model: 'procedural:window:{"type":"french_arch"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    // Master Attic Suite Bed
    { id: 'fha_a_bed1', catalogId: 'bed140x190', name: 'Attic Master Suite Bed', category: 'Bedroom', x: -180, y: -80, elevation: 0, angle: 0, width: 160, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#e11d48', floorLevel: 1 },
    { id: 'fha_a_ns1', catalogId: 'bedsideTable', name: 'Attic Nightstand Left', category: 'Bedroom', x: -290, y: -80, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 1 },
    { id: 'fha_a_ns2', catalogId: 'bedsideTable', name: 'Attic Nightstand Right', category: 'Bedroom', x: -70, y: -80, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 1 },
    { id: 'fha_a_ward1', catalogId: 'wardrobe', name: 'Attic Low Wardrobe', category: 'Bedroom', x: -180, y: 120, elevation: 0, angle: 0, width: 140, depth: 60, height: 180, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 1 },
    // Attic Twin Bedroom 2
    { id: 'fha_a_bed2', catalogId: 'bed90x190', name: 'Attic Twin Bed', category: 'Bedroom', x: 190, y: -80, elevation: 0, angle: 0, width: 100, depth: 200, height: 85, model: '/models/bed90x190.obj', icon: '/models/bed90x190.png', color: '#0ea5e9', floorLevel: 1 },
    { id: 'fha_a_desk', catalogId: 'squareTable', name: 'Attic Study Writing Desk', category: 'Bedroom', x: 190, y: 120, elevation: 0, angle: 0, width: 110, depth: 55, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#78350f', floorLevel: 1 },
    { id: 'fha_a_ch', catalogId: 'chair', name: 'Attic Desk Chair', category: 'Bedroom', x: 190, y: 65, elevation: 0, angle: 0, width: 45, depth: 45, height: 85, model: '/models/chair.obj', icon: '/models/chair.png', color: '#0284c7', floorLevel: 1 },
  ],
  rooms: [
    { id: 'rha_0', name: 'Ground Living & Hearth', floorLevel: 0, points: [{ x: -400, y: -300 }, { x: 40, y: -300 }, { x: 40, y: 300 }, { x: -400, y: 300 }], floorColor: '#e0f2fe', areaSquareMeters: 26.4 },
    { id: 'rha_gbed', name: 'Ground Guest Suite', floorLevel: 0, points: [{ x: 40, y: -300 }, { x: 400, y: -300 }, { x: 400, y: 50 }, { x: 40, y: 50 }], floorColor: '#fed7aa', areaSquareMeters: 12.6 },
    { id: 'rha_gbath', name: 'Ground Bathroom', floorLevel: 0, points: [{ x: 40, y: 50 }, { x: 400, y: 50 }, { x: 400, y: 300 }, { x: 40, y: 300 }], floorColor: '#99f6e4', areaSquareMeters: 9.0 },
    { id: 'rha_1', name: 'Attic Master Suite', floorLevel: 1, points: [{ x: -380, y: -260 }, { x: 0, y: -260 }, { x: 0, y: 260 }, { x: -380, y: 260 }], floorColor: '#fed7aa', areaSquareMeters: 19.7 },
    { id: 'rha_2', name: 'Attic Twin Bedroom', floorLevel: 1, points: [{ x: 0, y: -260 }, { x: 380, y: -260 }, { x: 380, y: 260 }, { x: 0, y: 260 }], floorColor: '#bae6fd', areaSquareMeters: 19.7 },
  ],
  dimensionLines: [
    { id: 'dim_ha_w', xStart: -400, yStart: -325, xEnd: 400, yEnd: -325, offset: 20, text: '800' },
    { id: 'dim_ha_h', xStart: 425, yStart: -300, xEnd: 425, yEnd: 300, offset: 20, text: '600' },
  ],
  textNotes: [
    { id: 'nha_title', text: '3-Bedroom house with attic', x: -180, y: 260, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 20, defaultWallHeight: 260, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// 9. 3-BEDROOM HOUSE WITH MEZZANINE (Luxury Duplex Villa with Double-Height Foyer)
// ============================================================================
export const houseWithMezzaninePlan: HomePlan = {
  id: 'demo-house-mezzanine',
  name: '3-Bedroom house with mezzanine',
  version: '2.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentFloor: 0,
  floors: [
    { level: 0, name: 'Ground Floor Grand Salon', elevation: 0, height: 280 },
    { level: 1, name: 'Mezzanine Gallery Floor', elevation: 280, height: 280 },
  ],
  walls: [
    // Ground Floor Perimeter
    { id: 'dwm_1', xStart: -420, yStart: -300, xEnd: 420, yEnd: -300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dwm_2', xStart: 420, yStart: -300, xEnd: 420, yEnd: 300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dwm_3', xStart: 420, yStart: 300, xEnd: -420, yEnd: 300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    { id: 'dwm_4', xStart: -420, yStart: 300, xEnd: -420, yEnd: -300, thickness: 20, height: 280, color: '#f8fafc', floorLevel: 0 },
    // Ground Floor Interior Divider (Separating Grand Foyer from Guest Suite)
    { id: 'dwm_gp1', xStart: 80, yStart: -300, xEnd: 80, yEnd: 300, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 0 },

    // 1st Floor Mezzanine Walls (Balcony Gallery)
    { id: 'dwm_10', xStart: -400, yStart: -280, xEnd: 400, yEnd: -280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dwm_11', xStart: 400, yStart: -280, xEnd: 400, yEnd: 280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dwm_12', xStart: 400, yStart: 280, xEnd: -400, yEnd: 280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    { id: 'dwm_13', xStart: -400, yStart: 280, xEnd: -400, yEnd: -280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
    // Mezzanine partition separating Master Suite from Executive Study & Spa
    { id: 'dwm_mp1', xStart: 0, yStart: -280, xEnd: 0, yEnd: 280, thickness: 15, height: 280, color: '#f8fafc', floorLevel: 1 },
  ],
  furniture: [
    // --- GROUND FLOOR (Level 0) ---
    // Doors & Windows
    { id: 'fhm_d_front', catalogId: 'doorModernFlush', name: 'Grand Double Foyer Entrance', category: 'Doors & Windows', x: -180, y: 300, elevation: 0, angle: 0, width: 110, depth: 15, height: 225, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#1e293b', floorLevel: 0 },
    { id: 'fhm_d_patio', catalogId: 'doorGlassFrench', name: 'French Terrace Sliding Doors', category: 'Doors & Windows', x: -180, y: -300, elevation: 0, angle: 0, width: 160, depth: 12, height: 225, model: 'procedural:door:{"type":"glass_french"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },
    { id: 'fhm_d_gbed', catalogId: 'doorModernFlush', name: 'Ground Guest Suite Door', category: 'Doors & Windows', x: 80, y: -50, elevation: 0, angle: Math.PI / 2, width: 85, depth: 12, height: 205, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 0 },

    { id: 'fhm_w_liv_w', catalogId: 'windowPanoramic', name: 'Grand Double-Height Glass Wall', category: 'Doors & Windows', x: -420, y: 0, elevation: 80, angle: Math.PI / 2, width: 220, depth: 15, height: 180, model: 'procedural:window:{"type":"picture_panoramic"}', icon: '/models/window85x123.png', color: '#0f172a', floorLevel: 0 },
    { id: 'fhm_w_gbed_e', catalogId: 'windowModernSliding', name: 'Guest Suite East Window', category: 'Doors & Windows', x: 420, y: 0, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 0 },

    // Grand Living Salon & Concert Piano
    { id: 'fhm_piano', catalogId: 'piano', name: 'Concert Grand Piano', category: 'Living', x: -280, y: -160, elevation: 0, angle: Math.PI / 4, width: 150, depth: 160, height: 100, model: '/models/piano.obj', icon: '/models/piano.png', color: '#09090b', floorLevel: 0 },
    { id: 'fhm_sofa', catalogId: 'sofa', name: 'Italian Velvet Curved Sofa', category: 'Living', x: -160, y: 0, elevation: 0, angle: 0, width: 220, depth: 95, height: 85, model: '/models/sofa.obj', icon: '/models/sofa.png', color: '#0284c7', floorLevel: 0 },
    { id: 'fhm_ct', catalogId: 'roundTable', name: 'Marble Coffee Table', category: 'Living', x: -160, y: 80, elevation: 0, angle: 0, width: 90, depth: 90, height: 45, model: '/models/roundTable.obj', icon: '/models/roundTable.png', color: '#78350f', floorLevel: 0 },
    { id: 'fhm_rug', catalogId: 'bathmat', name: 'Silk Area Rug', category: 'Living', x: -160, y: 70, elevation: 1, angle: 0, width: 220, depth: 160, height: 2, model: 'procedural:decor:{"type":"area_rug"}', icon: '/models/roundTable.png', color: '#0f766e', floorLevel: 0 },
    { id: 'fhm_plant', catalogId: 'plant', name: 'Grand Foyer Palm', category: 'Living', x: -380, y: 240, elevation: 0, angle: 0, width: 65, depth: 65, height: 150, model: '/models/plant.obj', icon: '/models/plant.png', color: '#16a34a', floorLevel: 0 },
    { id: 'fhm_chand', catalogId: 'chandelier', name: 'Double-Height Crystal Chandelier', category: 'Lighting', x: -180, y: -20, elevation: 240, angle: 0, width: 80, depth: 80, height: 75, model: 'procedural:lamp:{"type":"chandelier","shadeWidth":80,"shadeHeight":60,"totalHeight":75}', icon: '/models/pendantLamp.png', color: '#fef08a', floorLevel: 0, placementType: 'ceiling' },

    // Ground Floor Banquet Dining Suite
    { id: 'fhm_dt', catalogId: 'squareTable', name: 'Formal Dining Banquet Table', category: 'Living', x: 240, y: -130, elevation: 0, angle: 0, width: 180, depth: 100, height: 75, model: '/models/squareTable.obj', icon: '/models/squareTable.png', color: '#5c4033', floorLevel: 0 },
    { id: 'fhm_ch1', catalogId: 'chair', name: 'Dining Chair Left', category: 'Living', x: 170, y: -130, elevation: 0, angle: Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },
    { id: 'fhm_ch2', catalogId: 'chair', name: 'Dining Chair Right', category: 'Living', x: 310, y: -130, elevation: 0, angle: -Math.PI / 2, width: 45, depth: 45, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#c2410c', floorLevel: 0 },

    // Ground Floor Bedroom Suite
    { id: 'fhm_gbed', catalogId: 'bed140x190', name: 'Ground Guest Suite Bed', category: 'Bedroom', x: 240, y: 140, elevation: 0, angle: 0, width: 160, depth: 200, height: 90, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#eab308', floorLevel: 0 },
    { id: 'fhm_gward', catalogId: 'wardrobe', name: 'Guest Wardrobe', category: 'Bedroom', x: 370, y: 140, elevation: 0, angle: -Math.PI / 2, width: 120, depth: 60, height: 200, model: '/models/wardrobe.obj', icon: '/models/wardrobe.png', color: '#475569', floorLevel: 0 },

    // Outdoor Garden Pool & Lounge
    { id: 'fhm_deck1', catalogId: 'deckChair', name: 'Poolside Deck Chair 1', category: 'Garden', x: -340, y: -260, elevation: 0, angle: 0, width: 65, depth: 150, height: 70, model: 'procedural:outdoor:{"type":"deck_chair"}', icon: '/models/chair.png', color: '#0284c7', floorLevel: 0 },
    { id: 'fhm_deck2', catalogId: 'deckChair', name: 'Poolside Deck Chair 2', category: 'Garden', x: -250, y: -260, elevation: 0, angle: 0, width: 65, depth: 150, height: 70, model: 'procedural:outdoor:{"type":"deck_chair"}', icon: '/models/chair.png', color: '#0284c7', floorLevel: 0 },

    // --- MEZZANINE FLOOR (Level 1) ---
    // Doors & Windows
    { id: 'fhm_m_d', catalogId: 'doorModernFlush', name: 'Presidential Suite Door', category: 'Doors & Windows', x: 0, y: 0, elevation: 0, angle: Math.PI / 2, width: 90, depth: 12, height: 215, model: 'procedural:door:{"type":"modern_flush"}', icon: '/models/door.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fhm_m_win_w', catalogId: 'windowModernSliding', name: 'Mezzanine West Window', category: 'Doors & Windows', x: -400, y: 0, elevation: 90, angle: Math.PI / 2, width: 140, depth: 15, height: 120, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fhm_m_win_e', catalogId: 'windowModernSliding', name: 'Spa Bath East Window', category: 'Doors & Windows', x: 400, y: 120, elevation: 110, angle: Math.PI / 2, width: 100, depth: 15, height: 90, model: 'procedural:window:{"type":"modern_sliding"}', icon: '/models/window85x123.png', color: '#ffffff', floorLevel: 1 },

    // Presidential Master Suite (Left Wing)
    { id: 'fhm_m_bed', catalogId: 'bed140x190', name: 'Presidential Penthouse Suite Bed', category: 'Bedroom', x: -200, y: -80, elevation: 0, angle: 0, width: 180, depth: 200, height: 100, model: '/models/bed140x190.obj', icon: '/models/bed140x190.png', color: '#d97706', floorLevel: 1 },
    { id: 'fhm_m_ns1', catalogId: 'bedsideTable', name: 'Nightstand Left', category: 'Bedroom', x: -310, y: -80, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 1 },
    { id: 'fhm_m_ns2', catalogId: 'bedsideTable', name: 'Nightstand Right', category: 'Bedroom', x: -90, y: -80, elevation: 0, angle: 0, width: 45, depth: 40, height: 50, model: '/models/bedsideTable.obj', icon: '/models/bedsideTable.png', color: '#78350f', floorLevel: 1 },
    { id: 'fhm_m_arm', catalogId: 'armchair', name: 'Velvet Recliner', category: 'Living', x: -200, y: 120, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 90, height: 85, model: '/models/armchair.obj', icon: '/models/armchair.png', color: '#065f46', floorLevel: 1 },

    // Mezzanine Executive Study & Spa Bathroom (Right Wing)
    { id: 'fhm_m_desk', catalogId: 'squareTable', name: 'Executive Walnut Desk', category: 'Bedroom', x: 200, y: -120, elevation: 0, angle: 0, width: 140, depth: 70, height: 75, model: 'procedural:desk:{}', icon: '/models/squareTable.png', color: '#18181b', floorLevel: 1 },
    { id: 'fhm_m_ch', catalogId: 'chair', name: 'Executive Swivel Chair', category: 'Bedroom', x: 200, y: -65, elevation: 0, angle: 0, width: 55, depth: 55, height: 90, model: '/models/chair.obj', icon: '/models/chair.png', color: '#475569', floorLevel: 1 },
    { id: 'fhm_m_tub', catalogId: 'bath', name: 'Spa Jacuzzi Tub', category: 'Bathroom', x: 200, y: 120, elevation: 0, angle: 0, width: 180, depth: 90, height: 60, model: '/models/bath.obj', icon: '/models/bath.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fhm_m_wash', catalogId: 'washbasin', name: 'Double Vanity Washbasin', category: 'Bathroom', x: 330, y: 220, elevation: 0, angle: -Math.PI / 2, width: 90, depth: 55, height: 85, model: 'procedural:cabinet:{"columns":2,"rows":1,"doorType":"solid_doors","hasLegs":true}', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 1 },
    { id: 'fhm_m_wc', catalogId: 'toiletUnit', name: 'Porcelain Toilet', category: 'Bathroom', x: 80, y: 220, elevation: 0, angle: Math.PI / 2, width: 45, depth: 65, height: 75, model: '/models/toiletUnit.obj', icon: '/models/toiletUnit.png', color: '#ffffff', floorLevel: 1 },
  ],
  rooms: [
    { id: 'dr1', name: 'Grand Foyer & Reception Salon', floorLevel: 0, points: [{ x: -420, y: -300 }, { x: 80, y: -300 }, { x: 80, y: 300 }, { x: -420, y: 300 }], floorColor: '#f1f5f9', areaSquareMeters: 30.0 },
    { id: 'dr_gsuite', name: 'Ground Banquet & Guest Suite', floorLevel: 0, points: [{ x: 80, y: -300 }, { x: 420, y: -300 }, { x: 420, y: 300 }, { x: 80, y: 300 }], floorColor: '#e2e8f0', areaSquareMeters: 20.4 },
    { id: 'dr2', name: 'Presidential Penthouse Suite', floorLevel: 1, points: [{ x: -400, y: -280 }, { x: 0, y: -280 }, { x: 0, y: 280 }, { x: -400, y: 280 }], floorColor: '#fed7aa', areaSquareMeters: 22.4 },
    { id: 'dr3', name: 'Mezzanine Executive Study & Spa', floorLevel: 1, points: [{ x: 0, y: -280 }, { x: 400, y: -280 }, { x: 400, y: 280 }, { x: 0, y: 280 }], floorColor: '#bae6fd', areaSquareMeters: 22.4 },
  ],
  dimensionLines: [
    { id: 'dim_hm_w', xStart: -420, yStart: -325, xEnd: 420, yEnd: -325, offset: 20, text: '840' },
    { id: 'dim_hm_h', xStart: 445, yStart: -300, xEnd: 445, yEnd: 300, offset: 20, text: '600' },
  ],
  textNotes: [
    { id: 'nhm_title', text: '3-Bedroom house with mezzanine', x: -180, y: 260, color: '#dc2626', fontSize: 16 },
  ],
  preferences: { unitSystem: 'cm', defaultWallThickness: 20, defaultWallHeight: 280, gridSize: 20, magnetismEnabled: true, showRulers: true },
};

// ============================================================================
// The Complete 9 Sweet Home 3D Demos List
// ============================================================================
export interface SweetHomeDemoItem {
  id: string;
  name: string;
  badge?: string;
  category: 'Apartment' | 'House' | 'Blank';
  previewType: 'grid' | 'topdown' | 'exterior';
  plan: HomePlan;
}

export const SWEET_HOME_DEMOS: SweetHomeDemoItem[] = [
  {
    id: 'empty-home',
    name: 'Empty home',
    category: 'Blank',
    previewType: 'grid',
    plan: emptyHomePlan,
  },
  {
    id: 'studio',
    name: 'Studio',
    category: 'Apartment',
    previewType: 'topdown',
    plan: studioPlan,
  },
  {
    id: '1-bedroom-apt',
    name: '1-Bedroom apartment',
    category: 'Apartment',
    previewType: 'topdown',
    plan: oneBedroomAptPlan,
  },
  {
    id: '2-bedroom-apt',
    name: '2-Bedroom apartment',
    category: 'Apartment',
    previewType: 'topdown',
    plan: twoBedroomAptPlan,
  },
  {
    id: '3-bedroom-apt',
    name: '3-Bedroom apartment',
    category: 'Apartment',
    previewType: 'topdown',
    plan: threeBedroomAptPlan,
  },
  {
    id: 'bow-window-apt',
    name: 'Apartment with bow window',
    category: 'Apartment',
    previewType: 'topdown',
    plan: bowWindowAptPlan,
  },
  {
    id: '2-bedroom-house-basement',
    name: '2-Bedroom house with basement',
    category: 'House',
    previewType: 'exterior',
    plan: houseWithBasementPlan,
  },
  {
    id: '3-bedroom-house-attic',
    name: '3-Bedroom house with attic',
    category: 'House',
    previewType: 'exterior',
    plan: houseWithAtticPlan,
  },
  {
    id: '3-bedroom-house-mezzanine',
    name: '3-Bedroom house with mezzanine',
    category: 'House',
    previewType: 'exterior',
    plan: houseWithMezzaninePlan,
  },
];
