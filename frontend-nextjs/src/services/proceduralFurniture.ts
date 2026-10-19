import * as THREE from 'three';

export interface TableParams {
  shape: 'rectangular' | 'round' | 'oval' | 'hexagonal';
  width: number; // in cm
  depth: number; // in cm
  height: number; // in cm
  topThickness: number; // in cm
  legStyle: '4_legs_corner' | 'trestle_base' | 'pedestal_column' | 'hairpin_metal' | 'cross_x_legs';
  legThickness: number; // in cm
  bevel: boolean;
}

export interface ChairParams {
  seatType: 'cushioned' | 'wood_plank' | 'curved_shell';
  backrestStyle: 'solid_panel' | 'spindle_slats' | 'wingback' | 'backless';
  legStyle: 'tapered_wood' | 'metal_sled' | 'swivel_pedestal' | 'straight_4';
  width: number;
  depth: number;
  height: number;
  seatHeight: number;
}

export interface SofaParams {
  type: 'straight_2_seater' | 'straight_3_seater' | 'l_shape_left' | 'l_shape_right';
  cushionStyle: 'plump' | 'tufted' | 'minimal';
  armStyle: 'track_arm' | 'rolled_arm' | 'armless';
  legStyle: 'wooden_pegs' | 'metal_bracket' | 'plinth';
  width: number;
  depth: number;
  height: number;
}

export interface CabinetParams {
  columns: number;
  rows: number;
  doorType: 'open_shelf' | 'solid_doors' | 'glass_doors' | 'drawers' | 'arched_panel' | 'arched_glass' | 'arched_niche';
  width: number;
  depth: number;
  height: number;
  hasLegs: boolean;
  countertop?: boolean;
  finishStyle?: 'classic_painted' | 'fluted_oak' | 'stonybrook_green' | 'warm_greige';
  hasCrown?: boolean;
  underLighting?: boolean;
}

export interface BedParams {
  headboardStyle: 'tufted' | 'wood_slat' | 'floating_panel' | 'wingback' | 'none';
  frameStyle: 'platform' | 'upholstered_box' | 'canopy';
  width: number;
  depth: number;
  height: number;
  hasNightstands: boolean;
}

export interface LampParams {
  type: 'pendant_dome' | 'pendant_cone' | 'floor_arc' | 'table_lamp' | 'globe_orb' | 'ceiling_fan' | 'chandelier' | 'recessed_spot' | 'flush_panel';
  shadeWidth: number;
  shadeHeight: number;
  totalHeight: number;
}

export interface VehicleParams {
  type?: 'sedan' | 'suv' | 'sports' | 'coupe' | 'ev' | 'truck' | 'pickup' | 'vespa' | 'scooter' | 'bicycle' | 'bike';
  width: number;
  depth: number;
  height: number;
  color?: string;
  rimColor?: string;
}

export interface CustomPrimitive {
  id: string;
  shape: 'box' | 'cylinder' | 'sphere' | 'cone' | 'torus';
  width: number; // X in cm
  height: number; // Y in cm
  depth: number; // Z in cm
  x: number; // offset X in cm
  y: number; // offset Y in cm
  z: number; // offset Z in cm
  color?: string;
}

const CM = 0.01;

// Cache shared materials for metallic ferrules & accents
const brassCapMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  metalness: 0.92,
  roughness: 0.18,
});

const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  metalness: 0.95,
  roughness: 0.1,
});

/**
 * Creates a high-detail rounded box geometry with soft bevel edges (DecoFrog 3D Quality)
 */
export function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.015,
  smoothness: number = 3
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const eps = 0.0001;
  const r = Math.min(radius, width / 2 - eps, height / 2 - eps);
  const w = width / 2;
  const h = height / 2;

  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const extrudeSettings = {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: Math.min(r, depth / 4),
    bevelSize: r,
    bevelOffset: 0,
    bevelSegments: smoothness,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  geom.computeVertexNormals();
  return geom;
}

export function buildTableMeshGroup(params: TableParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const topMat = partMats?.top || mat;
  const legsMat = partMats?.legs || mat;

  const w = Math.max(20, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(20, params.height) * CM;
  const topThick = Math.max(2, params.topThickness || 4) * CM;
  const legThick = Math.max(2, params.legThickness || 6) * CM;

  let topMesh: THREE.Mesh;
  if (params.shape === 'round' && Math.abs(w - d) < 0.05) {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 48);
    geom.computeVertexNormals();
    topMesh = new THREE.Mesh(geom, topMat);
  } else if (params.shape === 'oval' || params.shape === 'round') {
    // True smooth beveled elliptical tabletop (DecoFrog 3D oval dining table)
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, w / 2 - 0.015, d / 2 - 0.015, 0, Math.PI * 2, false, 0);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: topThick,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 4,
      curveSegments: 48,
    });
    geom.center();
    geom.rotateX(Math.PI / 2);
    geom.computeVertexNormals();
    topMesh = new THREE.Mesh(geom, topMat);
  } else if (params.shape === 'hexagonal') {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 6);
    geom.computeVertexNormals();
    topMesh = new THREE.Mesh(geom, topMat);
  } else {
    const geom = createRoundedBoxGeometry(w, topThick, d, 0.02);
    topMesh = new THREE.Mesh(geom, topMat);
  }
  topMesh.position.y = h - topThick / 2;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  topMesh.userData = { partId: 'top' };
  group.add(topMesh);

  // DecoFrog 3D Detail: Under-table Apron Frame
  const apronThick = 0.02;
  const apronH = 0.05;
  const apronGeom = new THREE.BoxGeometry(w - legThick * 2, apronH, d - legThick * 2);
  const apronMesh = new THREE.Mesh(apronGeom, legsMat);
  apronMesh.position.y = h - topThick - apronH / 2;
  apronMesh.castShadow = true;
  apronMesh.userData = { partId: 'legs' };
  group.add(apronMesh);

  const legHeight = h - topThick;

  if (params.legStyle === 'pedestal_column' || params.shape === 'round') {
    const colGeom = new THREE.CylinderGeometry(legThick * 1.5, legThick * 2, legHeight, 32);
    colGeom.computeVertexNormals();
    const colMesh = new THREE.Mesh(colGeom, legsMat);
    colMesh.position.y = legHeight / 2;
    colMesh.castShadow = true;
    colMesh.userData = { partId: 'legs' };
    group.add(colMesh);

    const baseRadius = Math.min(w, d) * 0.38;
    const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius * 1.05, 0.035, 48);
    baseGeom.computeVertexNormals();
    const baseMesh = new THREE.Mesh(baseGeom, legsMat);
    baseMesh.position.y = 0.0175;
    baseMesh.castShadow = true;
    baseMesh.userData = { partId: 'legs' };
    group.add(baseMesh);
  } else if (params.legStyle === 'trestle_base' || params.legStyle === 'cross_x_legs') {
    const leftX = -w / 2 + 0.15;
    const rightX = w / 2 - 0.15;

    [leftX, rightX].forEach((posX) => {
      const trestleGeom = createRoundedBoxGeometry(legThick, legHeight, d * 0.75, 0.012);
      const tMesh = new THREE.Mesh(trestleGeom, legsMat);
      tMesh.position.set(posX, legHeight / 2, 0);
      tMesh.castShadow = true;
      tMesh.userData = { partId: 'legs' };
      group.add(tMesh);
    });

    const beamGeom = createRoundedBoxGeometry(w - 0.3, legThick * 0.8, legThick * 0.8, 0.01);
    const beamMesh = new THREE.Mesh(beamGeom, legsMat);
    beamMesh.position.set(0, legHeight * 0.3, 0);
    beamMesh.castShadow = true;
    beamMesh.userData = { partId: 'legs' };
    group.add(beamMesh);
  } else {
    const offsetX = w / 2 - legThick;
    const offsetZ = d / 2 - legThick;
    const legGeom = new THREE.CylinderGeometry(legThick * 0.7, legThick * 0.5, legHeight, 24);
    legGeom.computeVertexNormals();

    const positions = [
      [-offsetX, legHeight / 2, -offsetZ],
      [offsetX, legHeight / 2, -offsetZ],
      [-offsetX, legHeight / 2, offsetZ],
      [offsetX, legHeight / 2, offsetZ],
    ];

    positions.forEach(([x, y, z]) => {
      const legMesh = new THREE.Mesh(legGeom, legsMat);
      legMesh.position.set(x, y, z);
      legMesh.castShadow = true;
      legMesh.userData = { partId: 'legs' };
      group.add(legMesh);

      // DecoFrog 3D Metallic Brass Feet Caps (Ferrules)
      const capGeom = new THREE.CylinderGeometry(legThick * 0.52, legThick * 0.54, 0.04, 24);
      capGeom.computeVertexNormals();
      const capMesh = new THREE.Mesh(capGeom, brassCapMat);
      capMesh.position.set(x, 0.02, z);
      capMesh.userData = { partId: 'legs' };
      group.add(capMesh);
    });
  }

  return group;
}

export function buildChairMeshGroup(params: ChairParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const seatMat = partMats?.seat || mat;
  const backMat = partMats?.backrest || mat;
  const legsMat = partMats?.legs || mat;

  const w = Math.max(30, params.width) * CM;
  const d = Math.max(30, params.depth) * CM;
  const h = Math.max(40, params.height) * CM;
  const seatH = Math.max(25, params.seatHeight || 45) * CM;
  const seatThick = 0.06;

  // DecoFrog 3D Detail: Upholstered Seat Cushion with Beveled Edge
  const seatGeom = createRoundedBoxGeometry(w, seatThick, d, 0.025);
  const seatMesh = new THREE.Mesh(seatGeom, seatMat);
  seatMesh.position.set(0, seatH - seatThick / 2, 0);
  seatMesh.castShadow = true;
  seatMesh.userData = { partId: 'seat' };
  group.add(seatMesh);

  if (params.backrestStyle !== 'backless') {
    const backHeight = h - seatH;
    const backThick = 0.045;

    if (params.backrestStyle === 'spindle_slats') {
      // Wood Slats Backrest with Top Curved Arch Rail
      const railGeom = createRoundedBoxGeometry(w * 0.95, 0.04, 0.035, 0.01);
      const topRail = new THREE.Mesh(railGeom, backMat);
      topRail.position.set(0, h - 0.02, -d / 2 + 0.025);
      topRail.castShadow = true;
      topRail.userData = { partId: 'backrest' };
      group.add(topRail);

      const slatCount = 5;
      const slatGeom = new THREE.CylinderGeometry(0.008, 0.008, backHeight - 0.04, 16);
      slatGeom.computeVertexNormals();
      for (let i = 0; i < slatCount; i++) {
        const sx = -w * 0.35 + (i / (slatCount - 1)) * w * 0.7;
        const slatMesh = new THREE.Mesh(slatGeom, backMat);
        slatMesh.position.set(sx, seatH + (backHeight - 0.04) / 2, -d / 2 + 0.025);
        slatMesh.castShadow = true;
        slatMesh.userData = { partId: 'backrest' };
        group.add(slatMesh);
      }
    } else {
      // Ergonomic Solid / Upholstered Backrest Panel
      const backGeom = createRoundedBoxGeometry(w * 0.92, backHeight, backThick, 0.02);
      const backMesh = new THREE.Mesh(backGeom, backMat);
      backMesh.position.set(0, seatH + backHeight / 2, -d / 2 + backThick / 2);
      backMesh.rotation.x = -0.06; // subtle ergonomic recline
      backMesh.castShadow = true;
      backMesh.userData = { partId: 'backrest' };
      group.add(backMesh);
    }
  }

  const legHeight = seatH - seatThick;
  const legThick = 0.038;
  const offsetX = w / 2 - legThick * 1.2;
  const offsetZ = d / 2 - legThick * 1.2;

  const positions = [
    [-offsetX, legHeight / 2, -offsetZ],
    [offsetX, legHeight / 2, -offsetZ],
    [-offsetX, legHeight / 2, offsetZ],
    [offsetX, legHeight / 2, offsetZ],
  ];

  const legGeom = new THREE.CylinderGeometry(legThick * 0.65, legThick * 0.45, legHeight, 24);
  legGeom.computeVertexNormals();

  positions.forEach(([x, y, z]) => {
    const legMesh = new THREE.Mesh(legGeom, legsMat);
    legMesh.position.set(x, y, z);
    legMesh.castShadow = true;
    legMesh.userData = { partId: 'legs' };
    group.add(legMesh);

    // Brass Leg Caps
    const capGeom = new THREE.CylinderGeometry(legThick * 0.47, legThick * 0.49, 0.03, 24);
    const capMesh = new THREE.Mesh(capGeom, brassCapMat);
    capMesh.position.set(x, 0.015, z);
    capMesh.userData = { partId: 'legs' };
    group.add(capMesh);
  });

  // Cross-bracing stretchers
  const stretcherGeom = new THREE.CylinderGeometry(0.008, 0.008, w * 0.8, 12);
  stretcherGeom.rotateZ(Math.PI / 2);
  const stretcher1 = new THREE.Mesh(stretcherGeom, legsMat);
  stretcher1.position.set(0, legHeight * 0.4, -offsetZ);
  group.add(stretcher1);

  const stretcher2 = new THREE.Mesh(stretcherGeom, legsMat);
  stretcher2.position.set(0, legHeight * 0.4, offsetZ);
  group.add(stretcher2);

  return group;
}

export function buildSofaMeshGroup(params: SofaParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = partMats?.body || mat;
  const cushionsMat = partMats?.cushions || mat;
  const legsMat = partMats?.legs || mat;
  const pillowsMat = partMats?.pillows || cushionsMat;

  const w = Math.max(60, params.width) * CM;
  const d = Math.max(60, params.depth) * CM;
  const h = Math.max(50, params.height) * CM;
  const armWidth = Math.min(0.18, w * 0.12);

  // 1. Sleek Lower Platform / Base Frame with Soft Edges
  const baseH = 0.08;
  const baseGeom = createRoundedBoxGeometry(w, baseH, d, 0.015);
  const baseMesh = new THREE.Mesh(baseGeom, bodyMat);
  baseMesh.position.set(0, 0.12 + baseH / 2, 0);
  baseMesh.castShadow = true;
  baseMesh.userData = { partId: 'body' };
  group.add(baseMesh);

  // 2. Realistic Tapered Legs with Brass Ferrules
  const legH = 0.12;
  const legOffsets = [
    [-w / 2 + 0.08, -d / 2 + 0.08],
    [w / 2 - 0.08, -d / 2 + 0.08],
    [-w / 2 + 0.08, d / 2 - 0.08],
    [w / 2 - 0.08, d / 2 - 0.08],
  ];
  const legGeom = new THREE.CylinderGeometry(0.018, 0.028, legH, 24);
  legGeom.computeVertexNormals();
  legOffsets.forEach(([lx, lz]) => {
    const legMesh = new THREE.Mesh(legGeom, legsMat);
    legMesh.position.set(lx, legH / 2, lz);
    legMesh.castShadow = true;
    legMesh.userData = { partId: 'legs' };
    group.add(legMesh);

    const capGeom = new THREE.CylinderGeometry(0.029, 0.03, 0.025, 24);
    const capMesh = new THREE.Mesh(capGeom, brassCapMat);
    capMesh.position.set(lx, 0.0125, lz);
    capMesh.userData = { partId: 'legs' };
    group.add(capMesh);
  });

  // 3. Padded Backrest Structure
  const backH = h - 0.12;
  const backThick = Math.min(0.18, d * 0.22);
  const backGeom = createRoundedBoxGeometry(w, backH, backThick, 0.025);
  const backMesh = new THREE.Mesh(backGeom, bodyMat);
  backMesh.position.set(0, 0.12 + backH / 2, -d / 2 + backThick / 2);
  backMesh.castShadow = true;
  backMesh.userData = { partId: 'body' };
  group.add(backMesh);

  // 4. Track Armrests
  const seatW = w - armWidth * 2;
  const armH = h * 0.68;
  if (params.armStyle !== 'armless') {
    [-w / 2 + armWidth / 2, w / 2 - armWidth / 2].forEach((xPos) => {
      const armGeom = createRoundedBoxGeometry(armWidth, armH, d, 0.02);
      const armMesh = new THREE.Mesh(armGeom, bodyMat);
      armMesh.position.set(xPos, 0.12 + armH / 2, 0);
      armMesh.castShadow = true;
      armMesh.userData = { partId: 'body' };
      group.add(armMesh);
    });
  }

  // 5. Individual Plump Seat Cushions (DecoFrog 3D Multi-cushion design)
  const numCushions = w > 1.6 ? 3 : 2;
  const gap = 0.015;
  const cushionW = (seatW - gap * (numCushions - 1)) / numCushions;
  const cushionH = 0.16;
  const cushionD = d - backThick - 0.04;
  const seatCenterZ = -d / 2 + backThick + cushionD / 2 + 0.02;

  for (let i = 0; i < numCushions; i++) {
    const cx = -seatW / 2 + cushionW / 2 + i * (cushionW + gap);
    const cushionGeom = createRoundedBoxGeometry(cushionW * 0.98, cushionH, cushionD, 0.03);
    const cushionMesh = new THREE.Mesh(cushionGeom, cushionsMat);
    cushionMesh.position.set(cx, 0.12 + baseH + cushionH / 2, seatCenterZ);
    cushionMesh.castShadow = true;
    cushionMesh.userData = { partId: 'cushions' };
    group.add(cushionMesh);

    // Thick angled Back Cushions resting on the backrest
    const backCushionH = Math.max(0.3, (h - 0.28) * 0.7);
    const backCushionGeom = createRoundedBoxGeometry(cushionW * 0.96, backCushionH, 0.14, 0.025);
    const backCushionMesh = new THREE.Mesh(backCushionGeom, cushionsMat);
    backCushionMesh.position.set(cx, 0.12 + baseH + cushionH + backCushionH * 0.45, -d / 2 + backThick + 0.06);
    backCushionMesh.rotation.x = 0.12;
    backCushionMesh.castShadow = true;
    backCushionMesh.userData = { partId: 'cushions' };
    group.add(backCushionMesh);
  }

  // 6. Plump Organic Accent Throw Pillows
  const pilGeom = createRoundedBoxGeometry(0.24, 0.24, 0.1, 0.04);
  [-seatW / 2 + 0.14, seatW / 2 - 0.14].forEach((px, idx) => {
    const pillow = new THREE.Mesh(pilGeom, pillowsMat);
    pillow.position.set(px, 0.12 + baseH + cushionH + 0.12, -d / 2 + backThick + 0.16);
    pillow.rotation.y = idx === 0 ? 0.35 : -0.35;
    pillow.rotation.z = idx === 0 ? -0.1 : 0.1;
    pillow.castShadow = true;
    pillow.userData = { partId: 'pillows' };
    group.add(pillow);
  });

  if (params.type === 'l_shape_left' || params.type === 'l_shape_right') {
    const chaiseX = params.type === 'l_shape_left' ? -w / 2 + d * 0.4 : w / 2 - d * 0.4;
    const chaiseGeom = createRoundedBoxGeometry(d * 0.7, cushionH, d * 0.9, 0.03);
    const chaiseMesh = new THREE.Mesh(chaiseGeom, cushionsMat);
    chaiseMesh.position.set(chaiseX, 0.12 + baseH + cushionH / 2, d * 0.7);
    chaiseMesh.castShadow = true;
    chaiseMesh.userData = { partId: 'cushions' };
    group.add(chaiseMesh);
  }

  return group;
}

export function buildCabinetMeshGroup(params: CabinetParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();

  const isWallUnit = params.underLighting || (params.height <= 95 && !params.hasLegs && params.doorType.includes('arched') && !params.countertop);
  const isBaseUnit = params.countertop || (params.height >= 70 && params.height <= 95 && !isWallUnit);
  const isTallPantry = params.height > 160;

  // Dedicated luxury PBR material defaults
  const topMat = partMats?.top || (isBaseUnit
    ? new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.18, metalness: 0.05 }) // Calacatta Gold Marble slab
    : mat);
  const frameMat = partMats?.frame || mat;
  const doorsMat = partMats?.doors || mat;
  const legsMat = partMats?.legs || mat;
  const handlesMat = partMats?.handles || new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.28, metalness: 0.88 }); // Knurled Brushed Brass
  const glassMat = partMats?.glass || new THREE.MeshStandardMaterial({ color: 0xf0fdfa, roughness: 0.12, metalness: 0.08, opacity: 0.42, transparent: true }); // Reeded / Fluted Glass
  const lightingMat = partMats?.lighting || new THREE.MeshBasicMaterial({ color: 0xffedd5 }); // 2700K Warm LED strip glow
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.05 }); // White porcelain dinnerware

  const w = Math.max(30, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(30, params.height) * CM;
  const wallThick = 0.022;

  // Base plinth elevation vs legs
  let bottomElev = 0;
  if (params.hasLegs) {
    bottomElev = 0.1;
  } else if (!isWallUnit && h > 0.6) {
    bottomElev = 0.08; // 8cm architectural recessed toe-kick
  }

  const topSlabH = isBaseUnit ? 0.035 : wallThick;
  const interiorH = Math.max(0.2, h - bottomElev - topSlabH - wallThick);
  const sideH = interiorH + wallThick;

  // 1. Base Kickboard Plinth (Recessed Toe-Kick for Realistic Kitchen Architecture)
  if (!params.hasLegs && bottomElev > 0) {
    const plinthW = w - 0.03;
    const plinthD = d - 0.05; // 5cm front toe-kick shadow recess
    const plinthGeom = new THREE.BoxGeometry(plinthW, bottomElev, plinthD);
    const plinthMesh = new THREE.Mesh(plinthGeom, frameMat);
    plinthMesh.position.set(0, bottomElev / 2, -0.02);
    plinthMesh.castShadow = true;
    plinthMesh.userData = { partId: 'frame' };
    group.add(plinthMesh);
  }

  // 2. Tapered Brass-Ferrule Legs
  if (params.hasLegs) {
    const legGeom = new THREE.CylinderGeometry(0.018, 0.014, 0.1, 20);
    legGeom.computeVertexNormals();
    [
      [-w / 2 + 0.05, 0.05, -d / 2 + 0.05],
      [w / 2 - 0.05, 0.05, -d / 2 + 0.05],
      [-w / 2 + 0.05, 0.05, d / 2 - 0.05],
      [w / 2 - 0.05, 0.05, d / 2 - 0.05],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeom, legsMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      leg.userData = { partId: 'legs' };
      group.add(leg);

      const capGeom = new THREE.CylinderGeometry(0.015, 0.016, 0.025, 20);
      const capMesh = new THREE.Mesh(capGeom, handlesMat);
      capMesh.position.set(lx, 0.0125, lz);
      capMesh.userData = { partId: 'legs' };
      group.add(capMesh);
    });
  }

  // 3. Bottom Carcass Shelf
  const bottomGeom = createRoundedBoxGeometry(w, wallThick, d, 0.005);
  const bottomMesh = new THREE.Mesh(bottomGeom, frameMat);
  bottomMesh.position.set(0, bottomElev + wallThick / 2, 0);
  bottomMesh.castShadow = true;
  bottomMesh.userData = { partId: 'frame' };
  group.add(bottomMesh);

  // 4. Side Panels
  const sideGeom = new THREE.BoxGeometry(wallThick, sideH, d);
  const leftMesh = new THREE.Mesh(sideGeom, frameMat);
  leftMesh.position.set(-w / 2 + wallThick / 2, bottomElev + wallThick + interiorH / 2, 0);
  leftMesh.castShadow = true;
  leftMesh.userData = { partId: 'frame' };
  group.add(leftMesh);

  const rightMesh = new THREE.Mesh(sideGeom, frameMat);
  rightMesh.position.set(w / 2 - wallThick / 2, bottomElev + wallThick + interiorH / 2, 0);
  rightMesh.castShadow = true;
  rightMesh.userData = { partId: 'frame' };
  group.add(rightMesh);

  // 5. Back Panel
  const backGeom = new THREE.BoxGeometry(w - wallThick * 2, interiorH, 0.01);
  const backMesh = new THREE.Mesh(backGeom, frameMat);
  backMesh.position.set(0, bottomElev + wallThick + interiorH / 2, -d / 2 + 0.006);
  backMesh.userData = { partId: 'frame' };
  group.add(backMesh);

  // 6. Top Slab (Calacatta Marble Countertop with Bullnose Overhang OR Flush Frame Top)
  if (isBaseUnit) {
    const overhang = 0.025; // 2.5cm overhang on front and sides
    const topGeom = createRoundedBoxGeometry(w + overhang * 2, topSlabH, d + overhang, 0.006);
    const topMesh = new THREE.Mesh(topGeom, topMat);
    topMesh.position.set(0, h - topSlabH / 2, overhang / 2);
    topMesh.castShadow = true;
    topMesh.userData = { partId: 'top' };
    group.add(topMesh);
  } else {
    const topGeom = createRoundedBoxGeometry(w, topSlabH, d, 0.005);
    const topMesh = new THREE.Mesh(topGeom, topMat);
    topMesh.position.set(0, h - topSlabH / 2, 0);
    topMesh.castShadow = true;
    topMesh.userData = { partId: 'top' };
    group.add(topMesh);
  }

  // 7. Architectural Crown Molding / Stepped Cornice (for Pantries and Upper Cabinets)
  if (params.hasCrown || isTallPantry || (isWallUnit && params.height >= 70)) {
    const crown1Geom = createRoundedBoxGeometry(w + 0.04, 0.025, d + 0.03, 0.005);
    const crown1Mesh = new THREE.Mesh(crown1Geom, frameMat);
    crown1Mesh.position.set(0, h + 0.0125, 0.01);
    crown1Mesh.userData = { partId: 'frame' };
    group.add(crown1Mesh);

    const crown2Geom = createRoundedBoxGeometry(w + 0.07, 0.02, d + 0.05, 0.006);
    const crown2Mesh = new THREE.Mesh(crown2Geom, frameMat);
    crown2Mesh.position.set(0, h + 0.025 + 0.01, 0.015);
    crown2Mesh.userData = { partId: 'frame' };
    group.add(crown2Mesh);
  }

  // 8. Undermount Warm Task LED Strip (Concealed Lighting Channel)
  if (params.underLighting || isWallUnit) {
    const lightGeom = new THREE.BoxGeometry(w * 0.9, 0.008, 0.018);
    const lightMesh = new THREE.Mesh(lightGeom, lightingMat);
    lightMesh.position.set(0, bottomElev - 0.004, 0);
    lightMesh.userData = { partId: 'lighting' };
    group.add(lightMesh);
  }

  // 9. Interior Shelves & Luxury Staged Accessories (for Glass, Open Shelf, and Arched Niche)
  const showInterior = params.doorType === 'open_shelf' || params.doorType === 'arched_glass' || params.doorType === 'arched_niche';
  const shelfCount = Math.max(1, params.rows || (isTallPantry ? 4 : 2));

  if (showInterior) {
    for (let s = 1; s <= shelfCount; s++) {
      const shelfY = bottomElev + wallThick + (s / (shelfCount + 1)) * interiorH;
      const shelfGeom = createRoundedBoxGeometry(w - wallThick * 2, 0.018, d - 0.03, 0.004);
      const shelfMesh = new THREE.Mesh(shelfGeom, frameMat);
      shelfMesh.position.set(0, shelfY, 0.005);
      shelfMesh.userData = { partId: 'frame' };
      group.add(shelfMesh);

      // Add realistic staged dinnerware and glassware visible through glass
      if (s === 1 || s === 2) {
        // Stacked plates
        const plateGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.025, 18);
        plateGeom.computeVertexNormals();
        const plateMesh = new THREE.Mesh(plateGeom, dishMat);
        plateMesh.position.set(-w * 0.2, shelfY + 0.0125 + 0.009, 0);
        group.add(plateMesh);

        // Glass tumbler / vase
        const glassItemGeom = new THREE.CylinderGeometry(0.028, 0.024, 0.07, 16);
        glassItemGeom.computeVertexNormals();
        const glassItem = new THREE.Mesh(glassItemGeom, glassMat);
        glassItem.position.set(w * 0.2, shelfY + 0.035 + 0.009, 0);
        group.add(glassItem);
      }
    }
  }

  // 10. DOORS & FRONT MILLWORK
  const centerY = bottomElev + wallThick + interiorH / 2;
  const isArched = params.doorType === 'arched_panel' || params.doorType === 'arched_glass' || params.doorType === 'arched_niche';

  if (isArched) {
    const numCols = Math.max(1, params.columns || (w > 0.9 ? 2 : 1));
    const availW = w - wallThick * 2;
    const doorW = (availW / numCols) - 0.008; // 4mm shadow gap
    const doorH = interiorH - 0.008;
    const frameBorder = Math.min(0.05, Math.max(0.032, doorW * 0.16)); // Stile & rail frame thickness
    const archR = doorW / 2;
    const straightH = Math.max(0.08, doorH - archR);

    for (let c = 0; c < numCols; c++) {
      const doorX = -availW / 2 + (c + 0.5) * (availW / numCols);

      if (params.doorType === 'arched_niche') {
        // Arched Fascia Opening Niche (Open Alcove Frame)
        const outerNicheShape = new THREE.Shape();
        outerNicheShape.moveTo(-doorW / 2, -doorH / 2);
        outerNicheShape.lineTo(doorW / 2, -doorH / 2);
        outerNicheShape.lineTo(doorW / 2, -doorH / 2 + straightH);
        outerNicheShape.absarc(0, -doorH / 2 + straightH, archR, 0, Math.PI, false);
        outerNicheShape.lineTo(-doorW / 2, -doorH / 2);

        const nicheHole = new THREE.Path();
        const inArchR = Math.max(0.04, archR - frameBorder);
        const inStraightH = Math.max(0.05, straightH - frameBorder);
        nicheHole.moveTo(-inArchR, -doorH / 2 + frameBorder);
        nicheHole.lineTo(inArchR, -doorH / 2 + frameBorder);
        nicheHole.lineTo(inArchR, -doorH / 2 + frameBorder + inStraightH);
        nicheHole.absarc(0, -doorH / 2 + frameBorder + inStraightH, inArchR, 0, Math.PI, false);
        nicheHole.lineTo(-inArchR, -doorH / 2 + frameBorder);
        outerNicheShape.holes.push(nicheHole);

        const nicheGeom = new THREE.ExtrudeGeometry(outerNicheShape, {
          depth: 0.02,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.003,
          bevelSegments: 3,
          curveSegments: 32,
        });
        nicheGeom.computeVertexNormals();
        const nicheMesh = new THREE.Mesh(nicheGeom, doorsMat);
        nicheMesh.position.set(doorX, centerY, d / 2 - 0.015);
        nicheMesh.castShadow = true;
        nicheMesh.userData = { partId: 'doors' };
        group.add(nicheMesh);
        continue;
      }

      // Outer Stile & Rail Frame with Roman Arch Curve
      const outerShape = new THREE.Shape();
      outerShape.moveTo(-doorW / 2, -doorH / 2);
      outerShape.lineTo(doorW / 2, -doorH / 2);
      outerShape.lineTo(doorW / 2, -doorH / 2 + straightH);
      outerShape.absarc(0, -doorH / 2 + straightH, archR, 0, Math.PI, false);
      outerShape.lineTo(-doorW / 2, -doorH / 2);

      // Inner Cutout / Window
      const inW = Math.max(0.04, archR - frameBorder);
      const inStraightH = Math.max(0.05, straightH - frameBorder);
      const inArchR = inW;

      const innerHole = new THREE.Path();
      innerHole.moveTo(-inW, -doorH / 2 + frameBorder);
      innerHole.lineTo(inW, -doorH / 2 + frameBorder);
      innerHole.lineTo(inW, -doorH / 2 + frameBorder + inStraightH);
      innerHole.absarc(0, -doorH / 2 + frameBorder + inStraightH, inArchR, 0, Math.PI, false);
      innerHole.lineTo(-inW, -doorH / 2 + frameBorder);
      outerShape.holes.push(innerHole);

      const frameDoorGeom = new THREE.ExtrudeGeometry(outerShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.003,
        bevelSegments: 3,
        curveSegments: 32,
      });
      frameDoorGeom.computeVertexNormals();

      const frameDoorMesh = new THREE.Mesh(frameDoorGeom, doorsMat);
      frameDoorMesh.position.set(doorX, centerY, d / 2 - 0.01);
      frameDoorMesh.castShadow = true;
      frameDoorMesh.userData = { partId: 'doors' };
      group.add(frameDoorMesh);

      // Infill Panel (Reeded Fluted Glass OR Inset Beveled Timber Panel)
      const infillShape = new THREE.Shape();
      infillShape.moveTo(-inW, -doorH / 2 + frameBorder);
      infillShape.lineTo(inW, -doorH / 2 + frameBorder);
      infillShape.lineTo(inW, -doorH / 2 + frameBorder + inStraightH);
      infillShape.absarc(0, -doorH / 2 + frameBorder + inStraightH, inArchR, 0, Math.PI, false);
      infillShape.lineTo(-inW, -doorH / 2 + frameBorder);

      if (params.doorType === 'arched_glass') {
        const glassGeom = new THREE.ExtrudeGeometry(infillShape, {
          depth: 0.006,
          bevelEnabled: false,
          curveSegments: 32,
        });
        glassGeom.computeVertexNormals();
        const glassMesh = new THREE.Mesh(glassGeom, glassMat);
        glassMesh.position.set(doorX, centerY, d / 2 - 0.007);
        glassMesh.userData = { partId: 'glass' };
        group.add(glassMesh);
      } else {
        // Recessed Wood Panel with 2mm Micro-Bevel
        const panelGeom = new THREE.ExtrudeGeometry(infillShape, {
          depth: 0.012,
          bevelEnabled: true,
          bevelThickness: 0.002,
          bevelSize: 0.002,
          bevelSegments: 2,
          curveSegments: 32,
        });
        panelGeom.computeVertexNormals();
        const panelMesh = new THREE.Mesh(panelGeom, doorsMat);
        panelMesh.position.set(doorX, centerY, d / 2 - 0.014);
        panelMesh.castShadow = true;
        panelMesh.userData = { partId: 'doors' };
        group.add(panelMesh);
      }

      // Bespoke Hardware: Knurled Brushed Brass T-Bar Handle with Standoffs
      const handleX = numCols > 1
        ? (c === 0 ? doorX + doorW / 2 - frameBorder / 2 : doorX - doorW / 2 + frameBorder / 2)
        : doorX + doorW / 2 - frameBorder / 2;
      const handleY = isWallUnit ? centerY - doorH * 0.22 : (isBaseUnit ? centerY + doorH * 0.22 : centerY);

      // Main cylindrical T-bar
      const handleBarGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.13, 16);
      handleBarGeom.computeVertexNormals();
      const handleBar = new THREE.Mesh(handleBarGeom, handlesMat);
      handleBar.position.set(handleX, handleY, d / 2 + 0.022);
      handleBar.castShadow = true;
      handleBar.userData = { partId: 'handles' };
      group.add(handleBar);

      // Dual mounting standoffs
      const standoffGeom = new THREE.CylinderGeometry(0.0045, 0.0045, 0.018, 12);
      standoffGeom.rotateX(Math.PI / 2);
      standoffGeom.computeVertexNormals();

      [-0.045, 0.045].forEach((sy) => {
        const standoff = new THREE.Mesh(standoffGeom, handlesMat);
        standoff.position.set(handleX, handleY + sy, d / 2 + 0.01);
        standoff.userData = { partId: 'handles' };
        group.add(standoff);
      });
    }
  } else if (params.doorType === 'drawers') {
    // Stacked Kitchen Drawers with Horizontal Brass Bar Pulls
    const drawerCount = Math.max(2, params.rows || 3);
    const drawerH = (interiorH - 0.006 * drawerCount) / drawerCount;
    for (let dr = 0; dr < drawerCount; dr++) {
      const dry = bottomElev + wallThick + (dr + 0.5) * (interiorH / drawerCount);
      const drawerGeom = createRoundedBoxGeometry(w - wallThick * 2 - 0.01, drawerH * 0.94, 0.02, 0.006);
      const drawerMesh = new THREE.Mesh(drawerGeom, doorsMat);
      drawerMesh.position.set(0, dry, d / 2 - 0.008);
      drawerMesh.castShadow = true;
      drawerMesh.userData = { partId: 'doors' };
      group.add(drawerMesh);

      const pullGeom = new THREE.CylinderGeometry(0.006, 0.006, Math.min(0.24, w * 0.4), 16);
      pullGeom.rotateZ(Math.PI / 2);
      pullGeom.computeVertexNormals();
      const pullMesh = new THREE.Mesh(pullGeom, handlesMat);
      pullMesh.position.set(0, dry, d / 2 + 0.018);
      pullMesh.castShadow = true;
      pullMesh.userData = { partId: 'handles' };
      group.add(pullMesh);
    }
  } else if (params.doorType !== 'open_shelf') {
    // Standard Shaker Doors with Recessed Molding
    const numDoors = params.columns || 2;
    const doorWidth = (w - wallThick * 2) / numDoors;
    for (let didx = 0; didx < numDoors; didx++) {
      const dx = -((w - wallThick * 2) / 2) + (didx + 0.5) * doorWidth;
      const doorGeom = createRoundedBoxGeometry(doorWidth * 0.96, interiorH * 0.98, 0.02, 0.006);
      const doorMesh = new THREE.Mesh(doorGeom, doorsMat);
      doorMesh.position.set(dx, centerY, d / 2 - 0.008);
      doorMesh.castShadow = true;
      doorMesh.userData = { partId: 'doors' };
      group.add(doorMesh);

      // Handle pull bar
      const handleGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.13, 16);
      handleGeom.computeVertexNormals();
      const handleMesh = new THREE.Mesh(handleGeom, handlesMat);
      const hx = didx === 0 ? dx + doorWidth * 0.36 : dx - doorWidth * 0.36;
      handleMesh.position.set(hx, centerY, d / 2 + 0.016);
      handleMesh.castShadow = true;
      handleMesh.userData = { partId: 'handles' };
      group.add(handleMesh);
    }
  }

  return group;
}

export function buildBedMeshGroup(params: BedParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const frameMat = partMats?.frame || mat;
  const headMat = partMats?.headboard || mat;
  const beddingMat = partMats?.bedding || new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85, metalness: 0.05 });
  const pillowMat = partMats?.pillows || new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

  const w = Math.max(80, params.width) * CM;
  const d = Math.max(120, params.depth) * CM;
  const h = Math.max(40, params.height) * CM;
  const frameH = 0.25;

  // Solid Platform Frame
  const frameGeom = createRoundedBoxGeometry(w + 0.1, frameH, d + 0.1, 0.02);
  const frameMesh = new THREE.Mesh(frameGeom, frameMat);
  frameMesh.position.set(0, frameH / 2, 0);
  frameMesh.castShadow = true;
  frameMesh.userData = { partId: 'frame' };
  group.add(frameMesh);

  // DecoFrog 3D Detail: Layered Mattress with Quilted Edge
  const matGeom = createRoundedBoxGeometry(w, 0.22, d, 0.03);
  const matMesh = new THREE.Mesh(matGeom, beddingMat);
  matMesh.position.set(0, frameH + 0.11, 0);
  matMesh.castShadow = true;
  matMesh.userData = { partId: 'bedding' };
  group.add(matMesh);

  // Plush Dual Sleeping Pillows
  const pillowGeom = createRoundedBoxGeometry(w * 0.4, 0.11, 0.35, 0.035);
  [-w * 0.22, w * 0.22].forEach((xPos) => {
    const pillow = new THREE.Mesh(pillowGeom, pillowMat);
    pillow.position.set(xPos, frameH + 0.26, -d / 2 + 0.25);
    pillow.rotation.x = 0.08;
    pillow.castShadow = true;
    pillow.userData = { partId: 'pillows' };
    group.add(pillow);
  });

  if (params.headboardStyle !== 'none') {
    const headH = Math.max(0.6, h);
    const headGeom = createRoundedBoxGeometry(w + 0.15, headH, 0.1, 0.025);
    const headMesh = new THREE.Mesh(headGeom, headMat);
    headMesh.position.set(0, headH / 2, -d / 2 - 0.05);
    headMesh.castShadow = true;
    headMesh.userData = { partId: 'headboard' };
    group.add(headMesh);
  }

  return group;
}

export function buildLampMeshGroup(params: LampParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const shadeMat = partMats?.shade || mat;
  const stemMat = partMats?.stem || mat;
  const baseMat = partMats?.base || mat;
  const shadeR = (params.shadeWidth || 40) * CM * 0.5;
  const shadeH = (params.shadeHeight || 30) * CM;
  const totalH = (params.totalHeight || 60) * CM;

  if (params.type === 'ceiling_fan') {
    // 1. Motor Hub & Downrod
    const hubGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24);
    const hubMesh = new THREE.Mesh(hubGeom, mat);
    hubMesh.position.set(0, totalH - 0.15, 0);
    hubMesh.castShadow = true;
    group.add(hubMesh);

    const rodGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 12);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const rodMesh = new THREE.Mesh(rodGeom, rodMat);
    rodMesh.position.set(0, totalH - 0.075, 0);
    group.add(rodMesh);

    // 2. Light Dome underneath
    const lightGeom = new THREE.SphereGeometry(0.09, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    lightGeom.rotateX(Math.PI);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.6, roughness: 0.2 });
    const lightMesh = new THREE.Mesh(lightGeom, lightMat);
    lightMesh.position.set(0, totalH - 0.19, 0);
    group.add(lightMesh);

    // 3. Aerodynamic Fan Blades (5 blades)
    const bladeSpan = Math.max(0.3, shadeR * 0.9);
    const bladeGeom = new THREE.BoxGeometry(bladeSpan, 0.008, 0.12);
    for (let b = 0; b < 5; b++) {
      const angle = (b / 5) * Math.PI * 2;
      const bladeMesh = new THREE.Mesh(bladeGeom, mat);
      bladeMesh.position.set(Math.cos(angle) * (bladeSpan / 2 + 0.1), totalH - 0.15, Math.sin(angle) * (bladeSpan / 2 + 0.1));
      bladeMesh.rotation.y = -angle;
      bladeMesh.rotation.z = 0.1; // blade tilt angle
      bladeMesh.castShadow = true;
      group.add(bladeMesh);
    }
  } else if (params.type === 'chandelier') {
    // Crystal Tiered Chandelier
    const canopyGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.15 });
    const canopy = new THREE.Mesh(canopyGeom, goldMat);
    canopy.position.set(0, totalH - 0.015, 0);
    group.add(canopy);

    const chainGeom = new THREE.CylinderGeometry(0.006, 0.006, totalH * 0.35, 8);
    const chain = new THREE.Mesh(chainGeom, goldMat);
    chain.position.set(0, totalH - totalH * 0.175, 0);
    group.add(chain);

    // 3 Crystal Tiers
    [
      { r: shadeR * 0.85, y: totalH * 0.65, count: 12 },
      { r: shadeR * 0.6, y: totalH * 0.45, count: 8 },
      { r: shadeR * 0.35, y: totalH * 0.25, count: 6 },
    ].forEach((tier) => {
      const ringGeom = new THREE.TorusGeometry(tier.r, 0.01, 8, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeom, goldMat);
      ring.position.set(0, tier.y, 0);
      group.add(ring);

      const crystalGeom = new THREE.OctahedronGeometry(0.025, 0);
      const crystalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 });
      for (let i = 0; i < tier.count; i++) {
        const theta = (i / tier.count) * Math.PI * 2;
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        crystal.position.set(Math.cos(theta) * tier.r, tier.y - 0.04, Math.sin(theta) * tier.r);
        group.add(crystal);
      }
    });

    const bulbGeom = new THREE.SphereGeometry(0.05, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xffedd5, emissiveIntensity: 0.9 });
    const bulb = new THREE.Mesh(bulbGeom, bulbMat);
    bulb.position.set(0, totalH * 0.45, 0);
    group.add(bulb);
  } else if (params.type === 'recessed_spot') {
    // Recessed Ceiling Downlight
    const rimGeom = new THREE.RingGeometry(shadeR * 0.6, shadeR, 24);
    rimGeom.rotateX(-Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.position.set(0, totalH - 0.005, 0);
    group.add(rim);

    const lensGeom = new THREE.CircleGeometry(shadeR * 0.6, 24);
    lensGeom.rotateX(-Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xffedd5, emissiveIntensity: 1.0 });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    lens.position.set(0, totalH - 0.008, 0);
    group.add(lens);
  } else if (params.type === 'flush_panel') {
    // Modern Square/Circular Flush Light Panel
    const frameGeom = new THREE.BoxGeometry(shadeR * 2, 0.02, shadeR * 2);
    const frameMesh = new THREE.Mesh(frameGeom, mat);
    frameMesh.position.set(0, totalH - 0.01, 0);
    group.add(frameMesh);

    const diffuserGeom = new THREE.BoxGeometry(shadeR * 1.8, 0.01, shadeR * 1.8);
    const diffMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfffbeb, emissiveIntensity: 0.8 });
    const diffuser = new THREE.Mesh(diffuserGeom, diffMat);
    diffuser.position.set(0, totalH - 0.015, 0);
    group.add(diffuser);
  } else if (params.type === 'pendant_dome') {
    // Ceiling canopy mount
    const canopyGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
    const canopyMesh = new THREE.Mesh(canopyGeom, mat);
    canopyMesh.position.set(0, totalH - 0.01, 0);
    group.add(canopyMesh);

    // Downrod / suspension cable
    const cordLen = Math.max(0.05, totalH - shadeH);
    const cordGeom = new THREE.CylinderGeometry(0.004, 0.004, cordLen, 8);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
    const cordMesh = new THREE.Mesh(cordGeom, cordMat);
    cordMesh.position.set(0, totalH - cordLen / 2, 0);
    group.add(cordMesh);

    // Lamp dome shade hanging at bottom
    const domeGeom = new THREE.SphereGeometry(shadeR, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.rotateX(Math.PI);
    const domeMesh = new THREE.Mesh(domeGeom, mat);
    domeMesh.position.set(0, shadeH, 0);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    // Glowing bulb inside dome
    const bulbGeom = new THREE.SphereGeometry(0.04, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xfef08a, emissiveIntensity: 1.4 });
    const bulbMesh = new THREE.Mesh(bulbGeom, bulbMat);
    bulbMesh.position.set(0, shadeH - 0.02, 0);
    group.add(bulbMesh);
  } else if (params.type === 'globe_orb') {
    const orbGeom = new THREE.SphereGeometry(shadeR, 32, 24);
    const orbMesh = new THREE.Mesh(orbGeom, mat);
    orbMesh.position.set(0, totalH / 2, 0);
    group.add(orbMesh);
  } else {
    const shadeGeom = new THREE.CylinderGeometry(shadeR * 0.7, shadeR, shadeH, 24, 1, true);
    const shadeMesh = new THREE.Mesh(shadeGeom, shadeMat);
    shadeMesh.position.set(0, totalH - shadeH / 2, 0);
    shadeMesh.castShadow = true;
    shadeMesh.userData = { partId: 'shade' };
    group.add(shadeMesh);

    const poleGeom = new THREE.CylinderGeometry(0.015, 0.015, totalH - shadeH, 12);
    const poleMesh = new THREE.Mesh(poleGeom, stemMat);
    poleMesh.position.set(0, (totalH - shadeH) / 2, 0);
    poleMesh.userData = { partId: 'stem' };
    group.add(poleMesh);

    const baseGeom = new THREE.CylinderGeometry(shadeR * 0.8, shadeR * 0.8, 0.02, 24);
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.set(0, 0.01, 0);
    baseMesh.userData = { partId: 'base' };
    group.add(baseMesh);
  }

  return group;
}

export function buildCustomPrimitivesMeshGroup(primitives: CustomPrimitive[], fallbackMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  primitives.forEach((p) => {
    const w = p.width * CM;
    const h = p.height * CM;
    const d = p.depth * CM;
    let geom: THREE.BufferGeometry;

    if (p.shape === 'cylinder') {
      geom = new THREE.CylinderGeometry(w / 2, w / 2, h, 24);
    } else if (p.shape === 'sphere') {
      geom = new THREE.SphereGeometry(w / 2, 24, 16);
    } else if (p.shape === 'cone') {
      geom = new THREE.ConeGeometry(w / 2, h, 24);
    } else if (p.shape === 'torus') {
      geom = new THREE.TorusGeometry(w / 2, (p.depth || 5) * CM * 0.5, 16, 32);
    } else {
      geom = new THREE.BoxGeometry(w, h, d);
    }

    const mat = p.color
      ? new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.4, metalness: 0.2 })
      : fallbackMat;

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(p.x * CM, p.y * CM + h / 2, p.z * CM);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  return group;
}



export interface ShelfParams {
  type: 'floating' | 'hexagon' | 'modular_cubes' | 'industrial_pipe';
  width: number;
  depth: number;
  height: number;
  plankThickness?: number;
}

export interface DoorParams {
  type: 'barn_sliding' | 'modern_flush' | 'glass_french' | 'arched_wood';
  width: number;
  depth: number;
  height: number;
}

export interface WindowParams {
  type: 'modern_sliding' | 'french_arch' | 'picture_panoramic' | 'grid_double_hung';
  width: number;
  depth: number;
  height: number;
}

export interface WallDesignParams {
  type: 'wood_slat' | 'wainscoting' | 'brick_cladding' | 'marble_slab' | 'geometric_3d';
  width: number;
  depth: number;
  height: number;
}

export interface DecorParams {
  type: 'wall_art' | 'arched_mirror' | 'vanity_mirror' | 'curtains' | 'area_rug' | 'potted_plant';
  width: number;
  depth: number;
  height: number;
}

// ----------------------------------------------------
// SHELF MESH BUILDER
// ----------------------------------------------------
export function buildShelfMeshGroup(params: ShelfParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(20, params.width) * CM;
  const d = Math.max(10, params.depth) * CM;
  const h = Math.max(5, params.height) * CM;
  const thick = Math.max(1.5, params.plankThickness || 3) * CM;
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });

  if (params.type === 'hexagon') {
    // Hexagonal Honeycomb Shelf
    const radius = Math.min(w, h) / 2;
    const sideCount = 6;
    for (let i = 0; i < sideCount; i++) {
      const angle = (i * Math.PI) / 3;
      const nextAngle = ((i + 1) * Math.PI) / 3;
      const p1 = new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
      const p2 = new THREE.Vector2(Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius);
      const segLen = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const segAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      const plankGeom = new THREE.BoxGeometry(segLen, thick, d);
      const plankMesh = new THREE.Mesh(plankGeom, mat);
      plankMesh.position.set(mid.x, mid.y + radius, 0);
      plankMesh.rotation.z = segAngle;
      plankMesh.castShadow = true;
      group.add(plankMesh);
    }
    // Center divider shelf
    const midShelfGeom = new THREE.BoxGeometry(radius * 1.6, thick, d);
    const midShelf = new THREE.Mesh(midShelfGeom, mat);
    midShelf.position.set(0, radius, 0);
    midShelf.castShadow = true;
    group.add(midShelf);
  } else if (params.type === 'modular_cubes') {
    // 3 Staggered Display Cubes
    const cubeW = w * 0.45;
    const cubeH = h * 0.55;
    const cubes = [
      { x: -w * 0.25, y: cubeH / 2, w: cubeW, h: cubeH },
      { x: w * 0.25, y: h * 0.45, w: cubeW, h: cubeH },
      { x: 0, y: h * 0.75, w: cubeW * 0.8, h: cubeH * 0.8 },
    ];
    cubes.forEach((c) => {
      // Top & Bottom
      const tbGeom = new THREE.BoxGeometry(c.w, thick, d);
      const topM = new THREE.Mesh(tbGeom, mat);
      topM.position.set(c.x, c.y + c.h / 2, 0);
      const botM = new THREE.Mesh(tbGeom, mat);
      botM.position.set(c.x, c.y - c.h / 2, 0);
      // Sides
      const sideGeom = new THREE.BoxGeometry(thick, c.h, d);
      const leftM = new THREE.Mesh(sideGeom, mat);
      leftM.position.set(c.x - c.w / 2, c.y, 0);
      const rightM = new THREE.Mesh(sideGeom, mat);
      rightM.position.set(c.x + c.w / 2, c.y, 0);
      group.add(topM, botM, leftM, rightM);
    });
  } else if (params.type === 'industrial_pipe') {
    // 2 Shelves with Black Iron Pipes
    const shelfCount = 2;
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    for (let s = 0; s < shelfCount; s++) {
      const sy = (s + 0.4) * (h / shelfCount);
      const plankGeom = new THREE.BoxGeometry(w, thick, d);
      const plank = new THREE.Mesh(plankGeom, mat);
      plank.position.set(0, sy, 0);
      plank.castShadow = true;
      group.add(plank);
    }
    // Vertical pipes & flanges
    [-w * 0.4, w * 0.4].forEach((px) => {
      const pipeGeom = new THREE.CylinderGeometry(0.015, 0.015, h, 12);
      const pipe = new THREE.Mesh(pipeGeom, pipeMat);
      pipe.position.set(px, h / 2, 0);
      group.add(pipe);
      // Wall flanges
      [0.05, h - 0.05].forEach((fy) => {
        const flangeGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16);
        flangeGeom.rotateX(Math.PI / 2);
        const flange = new THREE.Mesh(flangeGeom, pipeMat);
        flange.position.set(px, fy, -d / 2);
        group.add(flange);
      });
    });
  } else {
    // Floating Solid Plank
    const plankGeom = new THREE.BoxGeometry(w, thick, d);
    const plank = new THREE.Mesh(plankGeom, mat);
    plank.position.set(0, thick / 2, 0);
    plank.castShadow = true;
    group.add(plank);

    // Wall mounting lip at rear
    const mountGeom = new THREE.BoxGeometry(w * 0.95, thick * 1.8, 0.02);
    const mount = new THREE.Mesh(mountGeom, mat);
    mount.position.set(0, thick * 0.9, -d / 2 + 0.01);
    group.add(mount);
  }

  return group;
}

// ----------------------------------------------------
// DOOR MESH BUILDER (With Proximity Swing & Slide Animation Pivots)
export function buildDoorMeshGroup(params: DoorParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  group.userData.isInteractive = true;
  group.userData.interactiveType = 'door';

  const panelMat = partMats?.panel || mat;
  const frameMat = partMats?.frame || mat;
  const handleMat = partMats?.handle || new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });

  const w = Math.max(50, params.width) * CM;
  const d = Math.max(4, params.depth) * CM;
  const h = Math.max(150, params.height) * CM;
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.25 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05, transmission: 0.9 });

  const bottomGap = 0.015; // 1.5cm bottom floor clearance

  if (params.type === 'barn_sliding') {
    // Top Steel Track (Stationary)
    const railGeom = new THREE.BoxGeometry(w * 1.8, 0.04, 0.02);
    const rail = new THREE.Mesh(railGeom, ironMat);
    rail.position.set(0, h + bottomGap + 0.08, d * 0.6);
    group.add(rail);

    // Sliding Door Assembly (Pivots/slides along X)
    const sliderGroup = new THREE.Group();
    sliderGroup.userData = {
      animType: 'slide_x',
      slideDist: w * 0.85,
      currentProgress: 0,
      targetProgress: 0,
    };

    // Rollers & Hangers attached to sliding door
    [-w * 0.35, w * 0.35].forEach((hx) => {
      const wheelGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.015, 16);
      wheelGeom.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeom, ironMat);
      wheel.position.set(hx, h + bottomGap + 0.08, d * 0.6 + 0.02);
      const strapGeom = new THREE.BoxGeometry(0.03, 0.18, 0.01);
      const strap = new THREE.Mesh(strapGeom, ironMat);
      strap.position.set(hx, h + bottomGap + 0.01, d * 0.6 + 0.02);
      sliderGroup.add(wheel, strap);
    });

    // Main Barn Door Leaf
    const leafH = h;
    const leafGeom = new THREE.BoxGeometry(w, leafH, 0.035);
    const leaf = new THREE.Mesh(leafGeom, mat);
    leaf.position.set(0, bottomGap + leafH / 2, 0);
    leaf.castShadow = true;
    sliderGroup.add(leaf);

    // Z-Brace Trim
    const braceThick = 0.008;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.08, braceThick), mat);
    topBar.position.set(0, bottomGap + leafH * 0.85, 0.02);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.08, braceThick), mat);
    botBar.position.set(0, bottomGap + leafH * 0.15, 0.02);
    sliderGroup.add(topBar, botBar);

    // Handle Bar
    const handleGeom = new THREE.BoxGeometry(0.03, 0.3, 0.025);
    const handle = new THREE.Mesh(handleGeom, ironMat);
    handle.position.set(w * 0.35, bottomGap + leafH * 0.5, 0.03);
    sliderGroup.add(handle);

    group.add(sliderGroup);
    group.userData.animParts = [sliderGroup];
  } else if (params.type === 'glass_french') {
    // Outer Frame (Stationary)
    const frameThick = 0.04;
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, d), mat);
    leftFrame.position.set(-w / 2 + frameThick / 2, h / 2, 0);
    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, d), mat);
    rightFrame.position.set(w / 2 - frameThick / 2, h / 2, 0);
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, d), mat);
    topFrame.position.set(0, h - frameThick / 2, 0);
    group.add(leftFrame, rightFrame, topFrame);

    // Floor Threshold Strip
    const threshold = new THREE.Mesh(new THREE.BoxGeometry(w, 0.006, d * 1.1), brassMat);
    threshold.position.set(0, 0.003, 0);
    group.add(threshold);

    const leafW = (w - frameThick * 2) / 2 - 0.005;
    const leafH = h - frameThick - bottomGap;

    // Left Leaf Hinge Pivot (Rotates Outwards -80 deg)
    const leftPivot = new THREE.Group();
    leftPivot.position.set(-w / 2 + frameThick, 0, 0);
    leftPivot.userData = {
      animType: 'hinge_left',
      openRotation: -Math.PI * 0.45,
      currentProgress: 0,
      targetProgress: 0,
    };

    const leftLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.035), mat);
    leftLeaf.position.set(leafW / 2, bottomGap + leafH / 2, 0);
    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.75, leafH * 0.8, 0.01), glassMat);
    leftGlass.position.set(leafW / 2, bottomGap + leafH / 2, 0);
    const leftMullion = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.75, 0.02, 0.015), mat);
    leftMullion.position.set(leafW / 2, bottomGap + leafH / 2, 0);
    const leftHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 12), brassMat);
    leftHandle.position.set(leafW - 0.03, bottomGap + leafH * 0.5, 0.03);
    leftPivot.add(leftLeaf, leftGlass, leftMullion, leftHandle);
    group.add(leftPivot);

    // Right Leaf Hinge Pivot (Rotates Outwards +80 deg)
    const rightPivot = new THREE.Group();
    rightPivot.position.set(w / 2 - frameThick, 0, 0);
    rightPivot.userData = {
      animType: 'hinge_right',
      openRotation: Math.PI * 0.45,
      currentProgress: 0,
      targetProgress: 0,
    };

    const rightLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.035), mat);
    rightLeaf.position.set(-leafW / 2, bottomGap + leafH / 2, 0);
    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.75, leafH * 0.8, 0.01), glassMat);
    rightGlass.position.set(-leafW / 2, bottomGap + leafH / 2, 0);
    const rightMullion = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.75, 0.02, 0.015), mat);
    rightMullion.position.set(-leafW / 2, bottomGap + leafH / 2, 0);
    const rightHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 12), brassMat);
    rightHandle.position.set(-leafW + 0.03, bottomGap + leafH * 0.5, 0.03);
    rightPivot.add(rightLeaf, rightGlass, rightMullion, rightHandle);
    group.add(rightPivot);

    group.userData.animParts = [leftPivot, rightPivot];
  } else if (params.type === 'arched_wood') {
    // Mediterranean Arched Door (Frame stationary, slab hinges open)
    const archR = w / 2;
    const rectH = h * 0.75 - bottomGap;

    const doorPivot = new THREE.Group();
    doorPivot.position.set(-w / 2, 0, 0);
    doorPivot.userData = {
      animType: 'hinge_single',
      openRotation: Math.PI * 0.48,
      currentProgress: 0,
      targetProgress: 0,
    };

    const rectGeom = new THREE.BoxGeometry(w, rectH, 0.04);
    const rectMesh = new THREE.Mesh(rectGeom, mat);
    rectMesh.position.set(w / 2, bottomGap + rectH / 2, 0);
    doorPivot.add(rectMesh);

    const archGeom = new THREE.CylinderGeometry(archR, archR, 0.04, 32, 1, false, 0, Math.PI);
    archGeom.rotateX(Math.PI / 2);
    archGeom.rotateZ(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeom, mat);
    archMesh.position.set(w / 2, bottomGap + rectH, 0);
    doorPivot.add(archMesh);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), brassMat);
    knob.position.set(w - 0.08, bottomGap + rectH * 0.6, 0.03);
    doorPivot.add(knob);

    group.add(doorPivot);
    group.userData.animParts = [doorPivot];
  } else {
    // Modern Flush Door with Hinge Pivot
    const frameThick = 0.04;
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, d), mat);
    leftPost.position.set(-w / 2 + frameThick / 2, h / 2, 0);
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h, d), mat);
    rightPost.position.set(w / 2 - frameThick / 2, h / 2, 0);
    const topPost = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, d), mat);
    topPost.position.set(0, h - frameThick / 2, 0);
    group.add(leftPost, rightPost, topPost);

    // Floor Threshold Plate
    const thresh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, d * 1.05), ironMat);
    thresh.position.set(0, 0.0025, 0);
    group.add(thresh);

    const slabW = w - frameThick * 2;
    const slabH = h - frameThick - bottomGap;

    // Hinge Pivot at Left Post
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-w / 2 + frameThick, 0, 0);
    doorPivot.userData = {
      animType: 'hinge_single',
      openRotation: Math.PI * 0.48, // ~87 degrees swing open
      currentProgress: 0,
      targetProgress: 0,
    };

    const slabGeom = new THREE.BoxGeometry(slabW, slabH, 0.038);
    const slab = new THREE.Mesh(slabGeom, mat);
    slab.position.set(slabW / 2, bottomGap + slabH / 2, 0);
    slab.castShadow = true;
    doorPivot.add(slab);

    const leverGeom = new THREE.BoxGeometry(0.12, 0.02, 0.04);
    const lever = new THREE.Mesh(leverGeom, ironMat);
    lever.position.set(slabW - 0.06, bottomGap + slabH * 0.48, 0.03);
    doorPivot.add(lever);

    group.add(doorPivot);
    group.userData.animParts = [doorPivot];
  }

  return group;
}

// ----------------------------------------------------
// WINDOW MESH BUILDER (With Proximity Sliding & Casement Pivots)
// ----------------------------------------------------
export function buildWindowMeshGroup(params: WindowParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  group.userData.isInteractive = true;
  group.userData.interactiveType = 'window';

  const w = Math.max(50, params.width) * CM;
  const d = Math.max(10, params.depth) * CM;
  const h = Math.max(60, params.height) * CM;
  const frameThick = 0.045;
  const sillH = 0.04;
  const interiorH = Math.max(0.15, h - frameThick - sillH);
  const centerY = sillH + interiorH / 2;

  // Clean, transparent double-sided glass material (renders reliably in WebGL without black artifacts)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: 0.42,
    roughness: 0.05,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });

  // 1. Sill at bottom (Stationary, projecting slightly on both sides)
  const sillGeom = new THREE.BoxGeometry(w + 0.06, sillH, d + 0.05);
  const sill = new THREE.Mesh(sillGeom, mat);
  sill.position.set(0, sillH / 2, 0);
  sill.castShadow = true;
  group.add(sill);

  // 2. Outer Window Perimeter Casing Frame
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, d), mat);
  topFrame.position.set(0, h - frameThick / 2, 0);
  topFrame.castShadow = true;

  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, interiorH, d), mat);
  leftFrame.position.set(-w / 2 + frameThick / 2, centerY, 0);
  leftFrame.castShadow = true;

  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, interiorH, d), mat);
  rightFrame.position.set(w / 2 - frameThick / 2, centerY, 0);
  rightFrame.castShadow = true;

  group.add(topFrame, leftFrame, rightFrame);

  const glassW = Math.max(0.2, w - frameThick * 2);
  const glassH = Math.max(0.2, interiorH - 0.015);

  if (params.type === 'french_arch') {
    // 3A. FRENCH SUNBURST ARCH TOP WINDOW
    const archR = w / 2;
    const archGeom = new THREE.CylinderGeometry(archR, archR, d, 32, 1, false, 0, Math.PI);
    archGeom.rotateX(Math.PI / 2);
    archGeom.rotateZ(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeom, mat);
    archMesh.position.set(0, h, 0);
    group.add(archMesh);

    // Arched Glass
    const pane = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.015), glassMat);
    pane.position.set(0, centerY, 0);
    group.add(pane);

    // French Casement Swing Pivot
    const windowPivot = new THREE.Group();
    windowPivot.position.set(-glassW / 2, 0, 0);
    windowPivot.userData = {
      animType: 'hinge_single',
      openRotation: Math.PI * 0.35,
      currentProgress: 0,
      targetProgress: 0,
    };
    group.add(windowPivot);
    group.userData.animParts = [windowPivot];

  } else if (params.type === 'picture_panoramic') {
    // 3B. PANORAMIC PICTURE WINDOW: Minimalist Slimline Sightline Glass Sheet
    const panGlass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.015), glassMat);
    panGlass.position.set(0, centerY, 0);
    group.add(panGlass);

  } else if (params.type === 'grid_double_hung') {
    // 3C. COLONIAL 6-PANE GRID WINDOW
    const pane = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.012), glassMat);
    pane.position.set(0, centerY, 0);
    group.add(pane);

    // Vertical Center Mullion
    const vertMullion = new THREE.Mesh(new THREE.BoxGeometry(0.02, glassH, 0.022), mat);
    vertMullion.position.set(0, centerY, 0);
    // Two Horizontal Muntin Bars
    const horiz1 = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.02, 0.022), mat);
    horiz1.position.set(0, centerY - glassH * 0.22, 0);
    const horiz2 = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.02, 0.022), mat);
    horiz2.position.set(0, centerY + glassH * 0.22, 0);
    group.add(vertMullion, horiz1, horiz2);

  } else {
    // 3D. MODERN SLIDING DOUBLE-GLAZED WINDOW (Standard Architectural Default)
    const paneW = glassW / 2;
    const sashBorder = 0.035;

    // Fixed Left Pane with framed sash
    const fixedGlass = new THREE.Mesh(new THREE.BoxGeometry(paneW - sashBorder, glassH - sashBorder, 0.012), glassMat);
    fixedGlass.position.set(-paneW / 2, centerY, -0.012);
    group.add(fixedGlass);

    const leftSashTop = new THREE.Mesh(new THREE.BoxGeometry(paneW, sashBorder, 0.028), mat);
    leftSashTop.position.set(-paneW / 2, centerY + (glassH - sashBorder) / 2, -0.012);
    const leftSashBtm = new THREE.Mesh(new THREE.BoxGeometry(paneW, sashBorder, 0.028), mat);
    leftSashBtm.position.set(-paneW / 2, centerY - (glassH - sashBorder) / 2, -0.012);
    const leftSashL = new THREE.Mesh(new THREE.BoxGeometry(sashBorder, glassH, 0.028), mat);
    leftSashL.position.set(-paneW + sashBorder / 2, centerY, -0.012);
    const leftSashR = new THREE.Mesh(new THREE.BoxGeometry(sashBorder, glassH, 0.028), mat);
    leftSashR.position.set(-sashBorder / 2, centerY, -0.012);
    group.add(leftSashTop, leftSashBtm, leftSashL, leftSashR);

    // Sliding Right Sash Pane (Slides Open on Proximity)
    const slidingSash = new THREE.Group();
    slidingSash.userData = {
      animType: 'slide_x',
      slideDist: -paneW * 0.85,
      currentProgress: 0,
      targetProgress: 0,
    };

    const movingGlass = new THREE.Mesh(new THREE.BoxGeometry(paneW - sashBorder, glassH - sashBorder, 0.012), glassMat);
    movingGlass.position.set(paneW / 2, centerY, 0.012);

    const rightSashTop = new THREE.Mesh(new THREE.BoxGeometry(paneW, sashBorder, 0.028), mat);
    rightSashTop.position.set(paneW / 2, centerY + (glassH - sashBorder) / 2, 0.012);
    const rightSashBtm = new THREE.Mesh(new THREE.BoxGeometry(paneW, sashBorder, 0.028), mat);
    rightSashBtm.position.set(paneW / 2, centerY - (glassH - sashBorder) / 2, 0.012);
    const rightSashL = new THREE.Mesh(new THREE.BoxGeometry(sashBorder, glassH, 0.028), mat);
    rightSashL.position.set(sashBorder / 2, centerY, 0.012);
    const rightSashR = new THREE.Mesh(new THREE.BoxGeometry(sashBorder, glassH, 0.028), mat);
    rightSashR.position.set(paneW - sashBorder / 2, centerY, 0.012);

    // Knurled Brass Hardware Latch Lock
    const latchMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const latchMesh = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.055, 0.018), latchMat);
    latchMesh.position.set(sashBorder / 2, centerY, 0.028);

    slidingSash.add(movingGlass, rightSashTop, rightSashBtm, rightSashL, rightSashR, latchMesh);
    group.add(slidingSash);
    group.userData.animParts = [slidingSash];
  }

  return group;
}

// ----------------------------------------------------
// WALL DESIGN / ACCENT PANEL MESH BUILDER
// ----------------------------------------------------
export function buildWallDesignMeshGroup(params: WallDesignParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(60, params.width) * CM;
  const d = Math.max(2, params.depth) * CM;
  const h = Math.max(100, params.height) * CM;

  if (params.type === 'wood_slat') {
    // Dark Acoustic Felt Backer
    const backerMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
    const backerGeom = new THREE.BoxGeometry(w, h, 0.01);
    const backer = new THREE.Mesh(backerGeom, backerMat);
    backer.position.set(0, h / 2, -d / 2 + 0.005);
    group.add(backer);

    // Vertical Wooden Slats
    const slatWidth = 0.035; // 3.5cm slat
    const slatGap = 0.02;   // 2cm gap
    const slatCount = Math.floor(w / (slatWidth + slatGap));
    const startX = -((slatCount - 1) * (slatWidth + slatGap)) / 2;

    for (let i = 0; i < slatCount; i++) {
      const sx = startX + i * (slatWidth + slatGap);
      const slatGeom = new THREE.BoxGeometry(slatWidth, h, d);
      const slatMesh = new THREE.Mesh(slatGeom, mat);
      slatMesh.position.set(sx, h / 2, 0);
      slatMesh.castShadow = true;
      group.add(slatMesh);
    }
  } else if (params.type === 'marble_slab') {
    // Luxury Marble Feature Wall with Gold Brass Inlay Strips
    const slabGeom = new THREE.BoxGeometry(w, h, d);
    const slabMesh = new THREE.Mesh(slabGeom, mat);
    slabMesh.position.set(0, h / 2, 0);
    slabMesh.castShadow = true;
    group.add(slabMesh);

    // Brass Metallic Strips
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.15 });
    [-w * 0.25, w * 0.25].forEach((bx) => {
      const stripGeom = new THREE.BoxGeometry(0.012, h, 0.005);
      const strip = new THREE.Mesh(stripGeom, brassMat);
      strip.position.set(bx, h / 2, d / 2 + 0.003);
      group.add(strip);
    });
  } else if (params.type === 'wainscoting') {
    // Baseboard + Chair Rail + Picture Frame Moldings
    const baseMat = mat;
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.015), baseMat);
    basePlate.position.set(0, h / 2, 0);
    group.add(basePlate);

    // Top Chair Rail
    const railGeom = new THREE.BoxGeometry(w, 0.06, 0.03);
    const rail = new THREE.Mesh(railGeom, baseMat);
    rail.position.set(0, h - 0.03, 0.01);
    group.add(rail);

    // Molded Rectangles
    const panelCount = Math.max(2, Math.floor(w / 0.6));
    const pw = (w - (panelCount + 1) * 0.08) / panelCount;
    const ph = h * 0.7;
    for (let p = 0; p < panelCount; p++) {
      const px = -w / 2 + 0.08 + pw / 2 + p * (pw + 0.08);
      const moldThick = 0.025;
      const topM = new THREE.Mesh(new THREE.BoxGeometry(pw, moldThick, 0.01), baseMat);
      topM.position.set(px, h * 0.45 + ph / 2, 0.015);
      const botM = new THREE.Mesh(new THREE.BoxGeometry(pw, moldThick, 0.01), baseMat);
      botM.position.set(px, h * 0.45 - ph / 2, 0.015);
      const leftM = new THREE.Mesh(new THREE.BoxGeometry(moldThick, ph, 0.01), baseMat);
      leftM.position.set(px - pw / 2, h * 0.45, 0.015);
      const rightM = new THREE.Mesh(new THREE.BoxGeometry(moldThick, ph, 0.01), baseMat);
      rightM.position.set(px + pw / 2, h * 0.45, 0.015);
      group.add(topM, botM, leftM, rightM);
    }
  } else {
    // General Accent / Brick Cladding Panel
    const panelGeom = new THREE.BoxGeometry(w, h, d);
    const panelMesh = new THREE.Mesh(panelGeom, mat);
    panelMesh.position.set(0, h / 2, 0);
    panelMesh.castShadow = true;
    group.add(panelMesh);
  }

  return group;
}

// ----------------------------------------------------
// INTERIOR DECOR & FIXTURES MESH BUILDER
// ----------------------------------------------------
export function buildInteriorDecorMeshGroup(params: DecorParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(20, params.width) * CM;
  const d = Math.max(5, params.depth) * CM;
  const h = Math.max(20, params.height) * CM;

  if (params.type === 'wall_art') {
    // Framed Canvas Wall Painting
    const frameThick = 0.035;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.5 });
    const frameGeom = new THREE.BoxGeometry(w, h, 0.03);
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.set(0, h / 2, 0);
    group.add(frame);

    // Canvas Art Inset
    const canvasGeom = new THREE.BoxGeometry(w - frameThick * 2, h - frameThick * 2, 0.01);
    const canvas = new THREE.Mesh(canvasGeom, mat);
    canvas.position.set(0, h / 2, 0.012);
    group.add(canvas);
  } else if (params.type === 'arched_mirror') {
    // Floor-Standing Arched Mirror
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.02, metalness: 0.95 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });

    const archR = w / 2;
    const rectH = h - archR;
    const rectGeom = new THREE.BoxGeometry(w, rectH, 0.03);
    const rectMesh = new THREE.Mesh(rectGeom, goldMat);
    rectMesh.position.set(0, rectH / 2, 0);
    group.add(rectMesh);

    const archGeom = new THREE.CylinderGeometry(archR, archR, 0.03, 32, 1, false, 0, Math.PI);
    archGeom.rotateX(Math.PI / 2);
    archGeom.rotateZ(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeom, goldMat);
    archMesh.position.set(0, rectH, 0);
    group.add(archMesh);

    // Mirror Inset
    const mirrorPane = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, h * 0.92, 0.005), mirrorMat);
    mirrorPane.position.set(0, h / 2, 0.016);
    group.add(mirrorPane);
  } else if (params.type === 'vanity_mirror') {
    // Backlit Round Vanity Mirror with LED Glow Halo
    const radius = Math.min(w, h) / 2;
    const rimGeom = new THREE.CylinderGeometry(radius, radius, 0.02, 36);
    rimGeom.rotateX(Math.PI / 2);
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0.98 });
    const mirror = new THREE.Mesh(rimGeom, mirrorMat);
    mirror.position.set(0, radius, 0);
    group.add(mirror);

    // Glowing LED Ring
    const ledGeom = new THREE.TorusGeometry(radius * 1.02, 0.015, 16, 48);
    const ledMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xffedd5, emissiveIntensity: 1.2 });
    const ledRing = new THREE.Mesh(ledGeom, ledMat);
    ledRing.position.set(0, radius, -0.01);
    group.add(ledRing);
  } else if (params.type === 'curtains') {
    // Window Curtains / Drapery with Top Rod & Finials
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, w * 1.15, 16), rodMat);
    rod.rotateZ(Math.PI / 2);
    rod.position.set(0, h - 0.03, 0);
    group.add(rod);

    // Left and Right Drapes with Wave Pleats
    [-w * 0.35, w * 0.35].forEach((dx) => {
      const drapeW = w * 0.28;
      const drapeH = h - 0.06;
      const drapeGeom = new THREE.BoxGeometry(drapeW, drapeH, 0.06);
      const drape = new THREE.Mesh(drapeGeom, mat);
      drape.position.set(dx, drapeH / 2, 0);
      drape.castShadow = true;
      group.add(drape);
    });
  } else if (params.type === 'area_rug') {
    // Plush Floor Area Rug
    const rugGeom = new THREE.BoxGeometry(w, 0.012, d);
    const rug = new THREE.Mesh(rugGeom, mat);
    rug.position.set(0, 0.006, 0);
    rug.receiveShadow = true;
    group.add(rug);
  } else if (params.type === 'potted_plant') {
    // Lush Indoor Potted Plant (Monstera / Ficus) on Tripod Stand
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const standMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });

    const potR = Math.min(w, d) * 0.35;
    const potH = h * 0.35;

    // Ceramic Pot
    const potGeom = new THREE.CylinderGeometry(potR, potR * 0.8, potH, 24);
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.set(0, potH / 2 + 0.1, 0);
    pot.castShadow = true;
    group.add(pot);

    // Wood Stand Legs
    for (let l = 0; l < 4; l++) {
      const legTheta = (l * Math.PI) / 2;
      const legGeom = new THREE.CylinderGeometry(0.012, 0.012, potH * 0.9, 12);
      const leg = new THREE.Mesh(legGeom, standMat);
      leg.position.set(Math.cos(legTheta) * (potR + 0.015), potH * 0.45, Math.sin(legTheta) * (potR + 0.015));
      group.add(leg);
    }

    // Plant Foliage (Multiple fan leaves)
    const stemCount = 8;
    for (let s = 0; s < stemCount; s++) {
      const theta = (s / stemCount) * Math.PI * 2;
      const leafGeom = new THREE.SphereGeometry(potR * 0.7, 8, 8);
      leafGeom.scale(1, 0.2, 1.6);
      const leafMesh = new THREE.Mesh(leafGeom, leafMat);
      leafMesh.position.set(
        Math.cos(theta) * potR * 0.5,
        potH + 0.1 + (s % 3) * 0.08,
        Math.sin(theta) * potR * 0.5
      );
      leafMesh.rotation.set(0.3, theta, 0.4);
      leafMesh.castShadow = true;
      group.add(leafMesh);
    }
  }

  return group;
}

// ----------------------------------------------------
// BOTANICAL & GARDEN ARCHITECTURE (TREES, PLANTS, HEDGES, FOUNTAINS)
// ----------------------------------------------------
export interface BotanicalParams {
  type?:
    | 'palm'
    | 'deciduous_tree'
    | 'cypress'
    | 'hedge'
    | 'topiary'
    | 'flowering_bush'
    | 'potted_monstera'
    | 'potted_fig'
    | 'potted_snake'
    | 'planter_box'
    | 'fountain'
    | 'weeping_willow'
    | 'bamboo'
    | 'bonsai'
    | 'cactus'
    | 'banana_palm'
    | 'pergola'
    | 'fire_pit';
  foliageStyle?: 'lush_green' | 'autumn_red' | 'sakura_pink' | 'golden_birch' | 'olive';
  potStyle?: 'ceramic_white' | 'terracotta' | 'charcoal_concrete' | 'rattan_basket' | 'brass';
  hasFlowers?: boolean;
  flowerColor?: string;
  width?: number;
  depth?: number;
  height?: number;
}

export function buildGardenBotanicalMeshGroup(
  params: BotanicalParams & { width: number; depth: number; height: number },
  fallbackMat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(25, params.width) * CM;
  const d = Math.max(25, params.depth) * CM;
  const h = Math.max(35, params.height) * CM;

  // Botanical Materials with partMats subpart overrides
  const foliageMat = partMats?.foliage || fallbackMat || new THREE.MeshStandardMaterial({
    color: params.foliageStyle === 'autumn_red' ? 0x991b1b :
           params.foliageStyle === 'sakura_pink' ? 0xf472b6 :
           params.foliageStyle === 'golden_birch' ? 0xeab308 :
           params.foliageStyle === 'olive' ? 0x4d6059 : 0x15803d,
    roughness: 0.5,
    metalness: 0.05,
  });

  const trunkMat = partMats?.trunk || new THREE.MeshStandardMaterial({
    color: 0x5c3d2e,
    roughness: 0.85,
    metalness: 0.05,
  });

  const potMat = partMats?.pot || new THREE.MeshStandardMaterial({
    color: params.potStyle === 'terracotta' ? 0xc26d24 :
           params.potStyle === 'charcoal_concrete' ? 0x1e293b :
           params.potStyle === 'rattan_basket' ? 0xd4a373 :
           params.potStyle === 'brass' ? 0xd4af37 : 0xfaf8f5,
    roughness: 0.4,
    metalness: 0.05,
  });

  const soilMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.95 });
  const flowerMat = partMats?.blossoms || new THREE.MeshStandardMaterial({
    color: params.flowerColor ? new THREE.Color(params.flowerColor) : 0xe11d48,
    roughness: 0.35,
    metalness: 0.05,
  });

  const type = params.type || (h > 1.8 ? 'deciduous_tree' : 'potted_monstera');

  if (type === 'palm') {
    // 1. TROPICAL ROYAL PALM TREE
    const trunkH = h * 0.72;
    const trunkR = Math.max(0.06, Math.min(w, d) * 0.08);
    const segH = trunkH / 3;
    let prevX = 0, prevZ = 0, prevY = 0;
    for (let i = 0; i < 3; i++) {
      const segGeom = new THREE.CylinderGeometry(trunkR * (1 - i * 0.12), trunkR * (1.1 - i * 0.1), segH, 12);
      const segMesh = new THREE.Mesh(segGeom, trunkMat);
      const nextX = prevX + (i === 1 ? 0.04 : 0);
      const nextZ = prevZ + (i === 2 ? -0.03 : 0);
      segMesh.position.set(nextX, prevY + segH / 2, nextZ);
      segMesh.castShadow = true;
      group.add(segMesh);
      prevX = nextX;
      prevZ = nextZ;
      prevY += segH;
    }
    // Crown shaft
    const crownGeom = new THREE.CylinderGeometry(trunkR * 0.8, trunkR * 0.75, h * 0.08, 12);
    const crownMesh = new THREE.Mesh(crownGeom, foliageMat);
    crownMesh.position.set(prevX, prevY + (h * 0.08) / 2, prevZ);
    group.add(crownMesh);

    // Coconuts cluster
    const cocoMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    for (let c = 0; c < 4; c++) {
      const cTheta = (c / 4) * Math.PI * 2;
      const coco = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cocoMat);
      coco.position.set(prevX + Math.cos(cTheta) * 0.08, prevY, prevZ + Math.sin(cTheta) * 0.08);
      group.add(coco);
    }

    // Radiating Palm Fronds
    const frondCount = 10;
    const frondLen = Math.max(w, d) * 0.52;
    for (let f = 0; f < frondCount; f++) {
      const fTheta = (f / frondCount) * Math.PI * 2 + (f % 2 ? 0.15 : 0);
      const frondGroup = new THREE.Group();
      frondGroup.position.set(prevX, prevY + h * 0.06, prevZ);

      // Rib
      const ribCurve = new THREE.CylinderGeometry(0.01, 0.02, frondLen, 8);
      const rib = new THREE.Mesh(ribCurve, trunkMat);
      rib.position.set(0, frondLen / 2, 0);
      frondGroup.add(rib);

      // Leaves along rib
      const leafCount = 6;
      for (let l = 1; l <= leafCount; l++) {
        const lp = (l / leafCount) * frondLen;
        const leafW = (1 - (l / leafCount) * 0.4) * 0.28;
        const leafG = new THREE.BoxGeometry(leafW, 0.005, 0.08);
        const leafM = new THREE.Mesh(leafG, foliageMat);
        leafM.position.set(0, lp, 0);
        leafM.rotation.y = Math.PI / 4;
        leafM.castShadow = true;
        frondGroup.add(leafM);
      }

      frondGroup.rotation.y = fTheta;
      frondGroup.rotation.z = Math.PI * 0.38 + (f % 3) * 0.06;
      group.add(frondGroup);
    }

  } else if (type === 'deciduous_tree') {
    // 2. SPREADING CANOPY SHADE TREE (OAK, JAPANESE MAPLE, FICUS)
    const trunkH = h * 0.48;
    const trunkR = Math.max(0.08, Math.min(w, d) * 0.12);
    const trunkGeom = new THREE.CylinderGeometry(trunkR * 0.7, trunkR * 1.1, trunkH, 14);
    const trunkMesh = new THREE.Mesh(trunkGeom, trunkMat);
    trunkMesh.position.set(0, trunkH / 2, 0);
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    // Primary Branches
    const branchGeom = new THREE.CylinderGeometry(trunkR * 0.4, trunkR * 0.6, trunkH * 0.45, 10);
    [-0.35, 0.35].forEach((angleOffset, bIdx) => {
      const bMesh = new THREE.Mesh(branchGeom, trunkMat);
      bMesh.position.set((bIdx === 0 ? -1 : 1) * trunkR * 0.8, trunkH * 0.85, 0);
      bMesh.rotation.z = angleOffset;
      group.add(bMesh);
    });

    // Cloud clusters canopy
    const canopyBaseY = trunkH * 0.9;
    const mainR = Math.max(w, d) * 0.38;
    // Central Main Dome
    const centerCanopy = new THREE.Mesh(new THREE.SphereGeometry(mainR, 14, 12), foliageMat);
    centerCanopy.scale.set(1, 0.85, 1);
    centerCanopy.position.set(0, canopyBaseY + mainR * 0.7, 0);
    centerCanopy.castShadow = true;
    group.add(centerCanopy);

    // 4 Organic Lobes surrounding center
    const lobes = [
      { x: mainR * 0.42, y: canopyBaseY + mainR * 0.4, z: mainR * 0.25, s: 0.75 },
      { x: -mainR * 0.42, y: canopyBaseY + mainR * 0.5, z: -mainR * 0.2, s: 0.8 },
      { x: mainR * 0.15, y: canopyBaseY + mainR * 0.85, z: -mainR * 0.35, s: 0.7 },
      { x: -mainR * 0.2, y: canopyBaseY + mainR * 0.35, z: mainR * 0.4, s: 0.72 },
    ];
    lobes.forEach((lb) => {
      const lobeMesh = new THREE.Mesh(new THREE.SphereGeometry(mainR * lb.s, 12, 10), foliageMat);
      lobeMesh.scale.set(1, 0.8, 1);
      lobeMesh.position.set(lb.x, lb.y, lb.z);
      lobeMesh.castShadow = true;
      group.add(lobeMesh);
    });

  } else if (type === 'cypress') {
    // 3. TUSCAN CYPRESS / COLUMNAR EVERGREEN
    const trunkH = h * 0.15;
    const trunkGeom = new THREE.CylinderGeometry(0.04, 0.06, trunkH, 10);
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.set(0, trunkH / 2, 0);
    group.add(trunk);

    const foliageH = h - trunkH;
    const tiers = 5;
    for (let t = 0; t < tiers; t++) {
      const progress = t / tiers;
      const tierH = (foliageH / tiers) * 1.35;
      const tierR = Math.min(w, d) * 0.38 * (1 - progress * 0.7);
      const coneGeom = new THREE.ConeGeometry(tierR, tierH, 14);
      const coneMesh = new THREE.Mesh(coneGeom, foliageMat);
      coneMesh.position.set(0, trunkH + progress * (foliageH * 0.85) + tierH / 2, 0);
      coneMesh.castShadow = true;
      group.add(coneMesh);
    }

  } else if (type === 'hedge') {
    // 4. BOXWOOD GARDEN HEDGE
    const hedgeGeom = createRoundedBoxGeometry(w, h * 0.92, d, Math.min(w, d, h) * 0.12);
    const hedge = new THREE.Mesh(hedgeGeom, foliageMat);
    hedge.position.set(0, (h * 0.92) / 2, 0);
    hedge.castShadow = true;
    group.add(hedge);

    // Soil base
    const baseG = new THREE.BoxGeometry(w * 0.98, 0.03, d * 0.98);
    const baseM = new THREE.Mesh(baseG, soilMat);
    baseM.position.set(0, 0.015, 0);
    group.add(baseM);

  } else if (type === 'topiary') {
    // 5. SPHERICAL URN TOPIARY
    const potH = h * 0.32;
    const potR = Math.min(w, d) * 0.32;
    const potGeom = new THREE.CylinderGeometry(potR, potR * 0.72, potH, 20);
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.set(0, potH / 2, 0);
    pot.castShadow = true;
    group.add(pot);

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.95, potR * 0.95, 0.02, 16), soilMat);
    soil.position.set(0, potH, 0);
    group.add(soil);

    const stemH = h * 0.35;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, stemH, 10), trunkMat);
    stem.position.set(0, potH + stemH / 2, 0);
    group.add(stem);

    const sphereR = Math.min(w, d) * 0.38;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(sphereR, 18, 16), foliageMat);
    sphere.position.set(0, potH + stemH + sphereR * 0.7, 0);
    sphere.castShadow = true;
    group.add(sphere);

  } else if (type === 'flowering_bush') {
    // 6. BLOOMING HYDRANGEA / LAVENDER BUSH
    const bushR = Math.min(w, d) * 0.45;
    const bushGeom = new THREE.SphereGeometry(bushR, 14, 12);
    bushGeom.scale(1, 0.75, 1);
    const bush = new THREE.Mesh(bushGeom, foliageMat);
    bush.position.set(0, bushR * 0.75, 0);
    bush.castShadow = true;
    group.add(bush);

    const count = 14;
    for (let b = 0; b < count; b++) {
      const phi = (b / count) * Math.PI * 0.8 + 0.15;
      const theta = b * 2.4;
      const bx = Math.sin(phi) * Math.cos(theta) * bushR * 0.98;
      const by = Math.cos(phi) * (bushR * 0.75) * 0.98 + bushR * 0.75;
      const bz = Math.sin(phi) * Math.sin(theta) * bushR * 0.98;

      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), flowerMat);
      bloom.position.set(bx, by, bz);
      group.add(bloom);
    }

  } else if (type === 'planter_box') {
    // 7. RAISED TIMBER GARDEN PLANTER BED
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.8 });
    const troughGeom = createRoundedBoxGeometry(w, h * 0.45, d, 0.02);
    const trough = new THREE.Mesh(troughGeom, boxMat);
    trough.position.set(0, (h * 0.45) / 2, 0);
    trough.castShadow = true;
    group.add(trough);

    const soilTop = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.03, d - 0.06), soilMat);
    soilTop.position.set(0, h * 0.44, 0);
    group.add(soilTop);

    const shrubCount = Math.max(2, Math.floor(w / 0.35));
    for (let sc = 0; sc < shrubCount; sc++) {
      const sx = -w / 2 + (w / (shrubCount + 1)) * (sc + 1);
      const shrubMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), foliageMat);
      shrubMesh.position.set(sx, h * 0.45 + 0.1, 0);
      group.add(shrubMesh);

      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), flowerMat);
      flower.position.set(sx, h * 0.45 + 0.2, 0);
      group.add(flower);
    }

  } else if (type === 'fountain') {
    // 8. CLASSIC TWO-TIER STONE GARDEN FOUNTAIN
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.7, transparent: true, opacity: 0.75 });

    const lowerR = Math.min(w, d) * 0.45;
    const lowerRim = new THREE.Mesh(new THREE.CylinderGeometry(lowerR, lowerR * 0.85, 0.25, 24), stoneMat);
    lowerRim.position.set(0, 0.125, 0);
    lowerRim.castShadow = true;
    group.add(lowerRim);

    const lowerWater = new THREE.Mesh(new THREE.CylinderGeometry(lowerR * 0.92, lowerR * 0.92, 0.02, 24), waterMat);
    lowerWater.position.set(0, 0.24, 0);
    group.add(lowerWater);

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(lowerR * 0.25, lowerR * 0.35, h * 0.45, 16), stoneMat);
    ped.position.set(0, 0.25 + (h * 0.45) / 2, 0);
    group.add(ped);

    const upperR = lowerR * 0.55;
    const upperRim = new THREE.Mesh(new THREE.CylinderGeometry(upperR, upperR * 0.8, 0.18, 20), stoneMat);
    upperRim.position.set(0, 0.25 + h * 0.45 + 0.09, 0);
    group.add(upperRim);

    const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(upperR * 0.9, upperR * 0.9, 0.02, 20), waterMat);
    upperWater.position.set(0, 0.25 + h * 0.45 + 0.17, 0);
    group.add(upperWater);

    const bubbler = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), stoneMat);
    bubbler.position.set(0, 0.25 + h * 0.45 + 0.26, 0);
    group.add(bubbler);

  } else if (type === 'weeping_willow') {
    // 9. GRACEFUL WEEPING WILLOW TREE
    const trunkH = h * 0.55;
    const trunkR = Math.max(0.08, Math.min(w, d) * 0.1);
    
    // Gnarled curving main trunk
    const trunkGeom = new THREE.CylinderGeometry(trunkR * 0.7, trunkR * 1.15, trunkH, 14);
    const trunkMesh = new THREE.Mesh(trunkGeom, trunkMat);
    trunkMesh.position.set(0, trunkH / 2, 0);
    trunkMesh.castShadow = true;
    trunkMesh.userData = { partId: 'trunk' };
    group.add(trunkMesh);

    // Crown canopy center
    const canopyCenter = new THREE.Mesh(new THREE.SphereGeometry(Math.min(w, d) * 0.35, 12, 10), foliageMat);
    canopyCenter.position.set(0, trunkH + 0.1, 0);
    canopyCenter.userData = { partId: 'foliage' };
    group.add(canopyCenter);

    // Cascading weeping tendrils
    const tendrilCount = 14;
    for (let t = 0; t < tendrilCount; t++) {
      const angle = (t / tendrilCount) * Math.PI * 2;
      const radius = Math.min(w, d) * 0.38 + (t % 3) * 0.05;
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius;
      const startY = trunkH + 0.05 + (t % 2) * 0.1;
      const drapeLen = trunkH * 0.75 + (t % 4) * 0.12;

      const tendril = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.006, drapeLen, 6), foliageMat);
      tendril.position.set(startX, startY - drapeLen / 2, startZ);
      tendril.rotation.z = Math.cos(angle) * 0.1;
      tendril.rotation.x = Math.sin(angle) * 0.1;
      tendril.castShadow = true;
      tendril.userData = { partId: 'foliage' };
      group.add(tendril);

      // Drooping foliage cloud tips
      const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), foliageMat);
      tipMesh.scale.set(1, 1.8, 1);
      tipMesh.position.set(startX, startY - drapeLen, startZ);
      tipMesh.userData = { partId: 'foliage' };
      group.add(tipMesh);
    }

  } else if (type === 'bamboo') {
    // 10. ZEN BAMBOO GROVE WITH NODES & LEAF CLUSTERS
    const baseW = w * 0.9;
    const baseD = d * 0.7;
    const planterH = 0.22;

    // Modern rectangular bamboo planter
    const planterGeom = createRoundedBoxGeometry(baseW, planterH, baseD, 0.02);
    const planter = new THREE.Mesh(planterGeom, potMat);
    planter.position.set(0, planterH / 2, 0);
    planter.userData = { partId: 'pot' };
    group.add(planter);

    const soilMesh = new THREE.Mesh(new THREE.BoxGeometry(baseW - 0.04, 0.02, baseD - 0.04), soilMat);
    soilMesh.position.set(0, planterH + 0.01, 0);
    group.add(soilMesh);

    // Staggered vertical bamboo culms
    const culmCount = 7;
    const bambooMat = partMats?.trunk || new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.35 });
    for (let c = 0; c < culmCount; c++) {
      const frac = c / (culmCount - 1);
      const cx = -baseW * 0.38 + frac * baseW * 0.76;
      const cz = ((c % 2 === 0 ? 1 : -1) * baseD * 0.2) + (Math.sin(c) * 0.03);
      const culmH = (h - planterH) * (0.85 + (c % 3) * 0.07);
      const culmR = 0.025;

      const culm = new THREE.Mesh(new THREE.CylinderGeometry(culmR, culmR, culmH, 12), bambooMat);
      culm.position.set(cx, planterH + culmH / 2, cz);
      culm.castShadow = true;
      culm.userData = { partId: 'trunk' };
      group.add(culm);

      // Node rings
      const nodeCount = 5;
      for (let n = 1; n <= nodeCount; n++) {
        const ny = planterH + (culmH / (nodeCount + 1)) * n;
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(culmR * 1.25, culmR * 1.25, 0.015, 12), bambooMat);
        ring.position.set(cx, ny, cz);
        group.add(ring);

        // Leaf spray clusters branching from node
        const sprayAngle = (n * 1.7 + c) % (Math.PI * 2);
        const spray = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), foliageMat);
        spray.scale.set(1.4, 0.2, 0.6);
        spray.position.set(cx + Math.cos(sprayAngle) * 0.1, ny + 0.04, cz + Math.sin(sprayAngle) * 0.1);
        spray.rotation.y = sprayAngle;
        spray.rotation.z = 0.2;
        spray.userData = { partId: 'foliage' };
        group.add(spray);
      }
    }

  } else if (type === 'bonsai') {
    // 11. CURATED JAPANESE JUNIPER BONSAI
    const trayW = w * 0.85;
    const trayD = d * 0.65;
    const trayH = 0.08;

    // Glazed shallow ceramic bonsai tray
    const trayGeom = createRoundedBoxGeometry(trayW, trayH, trayD, 0.025);
    const tray = new THREE.Mesh(trayGeom, potMat);
    tray.position.set(0, trayH / 2, 0);
    tray.userData = { partId: 'pot' };
    group.add(tray);

    const soilMesh = new THREE.Mesh(new THREE.CylinderGeometry(trayW * 0.42, trayW * 0.45, 0.02, 16), soilMat);
    soilMesh.scale.set(1, 1, trayD / trayW);
    soilMesh.position.set(0, trayH + 0.01, 0);
    group.add(soilMesh);

    // Weathered S-curved bonsai trunk
    const trunkSegments = 3;
    let prevX = 0, prevY = trayH + 0.02, prevZ = 0;
    const segH = (h - trayH) * 0.28;
    for (let s = 0; s < trunkSegments; s++) {
      const segR = 0.04 * (1 - s * 0.2);
      const segMesh = new THREE.Mesh(new THREE.CylinderGeometry(segR * 0.8, segR, segH, 10), trunkMat);
      const nextX = prevX + (s === 0 ? 0.06 : s === 1 ? -0.04 : 0.02);
      const nextZ = prevZ + (s === 1 ? 0.04 : -0.02);
      segMesh.position.set(nextX, prevY + segH / 2, nextZ);
      segMesh.rotation.z = s === 0 ? -0.2 : (s === 1 ? 0.25 : -0.1);
      segMesh.castShadow = true;
      segMesh.userData = { partId: 'trunk' };
      group.add(segMesh);
      prevX = nextX;
      prevZ = nextZ;
      prevY += segH * 0.9;
    }

    // Cloud foliage pads
    const cloudOffsets = [
      [prevX - 0.12, prevY - 0.05, prevZ + 0.05, 0.16],
      [prevX + 0.14, prevY + 0.02, prevZ - 0.04, 0.18],
      [prevX, prevY + 0.12, prevZ, 0.22],
    ];
    cloudOffsets.forEach(([cx, cy, cz, cr]) => {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(cr, 10, 8), foliageMat);
      pad.scale.set(1.4, 0.35, 1.1);
      pad.position.set(cx, cy, cz);
      pad.castShadow = true;
      pad.userData = { partId: 'foliage' };
      group.add(pad);
    });

  } else if (type === 'cactus') {
    // 12. DESERT SAGUARO CACTUS & TERRACOTTA POT
    const potR = Math.min(w, d) * 0.35;
    const potH = h * 0.28;
    const potMesh = new THREE.Mesh(new THREE.CylinderGeometry(potR, potR * 0.75, potH, 18), potMat);
    potMesh.position.set(0, potH / 2, 0);
    potMesh.castShadow = true;
    potMesh.userData = { partId: 'pot' };
    group.add(potMesh);

    const sandMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    const sandMesh = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.94, potR * 0.94, 0.02, 16), sandMat);
    sandMesh.position.set(0, potH + 0.01, 0);
    group.add(sandMesh);

    // Central ribbed stem
    const cactusR = potR * 0.45;
    const stemH = h - potH;
    const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(cactusR, cactusR * 1.05, stemH, 14), foliageMat);
    stemMesh.position.set(0, potH + stemH / 2, 0);
    stemMesh.castShadow = true;
    stemMesh.userData = { partId: 'foliage' };
    group.add(stemMesh);

    const capMesh = new THREE.Mesh(new THREE.SphereGeometry(cactusR, 12, 10), foliageMat);
    capMesh.position.set(0, potH + stemH, 0);
    capMesh.userData = { partId: 'foliage' };
    group.add(capMesh);

    // Left curved arm
    const armR = cactusR * 0.75;
    const arm1H = stemH * 0.35;
    const elbow1 = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, cactusR * 1.6, 10), foliageMat);
    elbow1.rotateZ(Math.PI / 2);
    elbow1.position.set(-cactusR * 1.2, potH + stemH * 0.45, 0);
    elbow1.userData = { partId: 'foliage' };
    group.add(elbow1);

    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, arm1H, 10), foliageMat);
    arm1.position.set(-cactusR * 1.8, potH + stemH * 0.45 + arm1H / 2, 0);
    arm1.userData = { partId: 'foliage' };
    group.add(arm1);

    // Right curved arm (staggered height)
    const elbow2 = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, cactusR * 1.5, 10), foliageMat);
    elbow2.rotateZ(Math.PI / 2);
    elbow2.position.set(cactusR * 1.15, potH + stemH * 0.6, 0);
    elbow2.userData = { partId: 'foliage' };
    group.add(elbow2);

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(armR, armR, arm1H * 0.8, 10), foliageMat);
    arm2.position.set(cactusR * 1.7, potH + stemH * 0.6 + (arm1H * 0.8) / 2, 0);
    arm2.userData = { partId: 'foliage' };
    group.add(arm2);

  } else if (type === 'banana_palm') {
    // 13. TROPICAL WIDE-LEAF BANANA PALM
    const stemH = h * 0.55;
    const stemR = Math.max(0.06, Math.min(w, d) * 0.08);

    const pseudostem = new THREE.Mesh(new THREE.CylinderGeometry(stemR * 0.8, stemR * 1.2, stemH, 12), trunkMat);
    pseudostem.position.set(0, stemH / 2, 0);
    pseudostem.castShadow = true;
    pseudostem.userData = { partId: 'trunk' };
    group.add(pseudostem);

    // Large paddle-shaped arching leaves
    const leafCount = 7;
    for (let l = 0; l < leafCount; l++) {
      const angle = (l / leafCount) * Math.PI * 2;
      const leafLen = Math.min(w, d) * 0.55;
      const leafW = leafLen * 0.4;

      const leaf = new THREE.Mesh(new THREE.SphereGeometry(leafLen * 0.5, 10, 8), foliageMat);
      leaf.scale.set(leafW / leafLen, 0.05, 1.8);
      leaf.position.set(
        Math.cos(angle) * leafLen * 0.45,
        stemH + 0.1 + (l % 2) * 0.08,
        Math.sin(angle) * leafLen * 0.45
      );
      leaf.rotation.set(0.4, angle, 0.35);
      leaf.castShadow = true;
      leaf.userData = { partId: 'foliage' };
      group.add(leaf);
    }

  } else if (type === 'pergola') {
    // 14. ARCHITECTURAL CEDAR GARDEN PERGOLA GAZEBO
    const postThick = 0.12;
    const postH = h * 0.92;
    const timberMat = partMats?.trunk || new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });

    // 4 Corner Posts
    const xOff = w / 2 - postThick / 2;
    const zOff = d / 2 - postThick / 2;
    [[-xOff, -zOff], [xOff, -zOff], [-xOff, zOff], [xOff, zOff]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(postThick, postH, postThick), timberMat);
      post.position.set(px, postH / 2, pz);
      post.castShadow = true;
      post.userData = { partId: 'trunk' };
      group.add(post);

      // Decorative post base pedestal
      const base = new THREE.Mesh(new THREE.BoxGeometry(postThick * 1.6, 0.12, postThick * 1.6), timberMat);
      base.position.set(px, 0.06, pz);
      group.add(base);

      // Climbing ivy vines up the post
      const ivy = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, postH * 0.75, 8), foliageMat);
      ivy.position.set(px, (postH * 0.75) / 2, pz);
      ivy.userData = { partId: 'foliage' };
      group.add(ivy);
    });

    // 2 Main Longitudinal Support Beams
    const beamH = 0.16;
    const beamW = 0.08;
    [-zOff, zOff].forEach((bz) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(w * 1.1, beamH, beamW), timberMat);
      beam.position.set(0, postH + beamH / 2, bz);
      beam.castShadow = true;
      beam.userData = { partId: 'trunk' };
      group.add(beam);
    });

    // Cross Rafter Slat Beams (Providing Dappled Shade)
    const rafterCount = 7;
    for (let r = 0; r < rafterCount; r++) {
      const rx = -w / 2 + (w / (rafterCount - 1)) * r;
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, d * 1.15), timberMat);
      rafter.position.set(rx, postH + beamH + 0.06, 0);
      rafter.castShadow = true;
      rafter.userData = { partId: 'trunk' };
      group.add(rafter);
    }

  } else if (type === 'fire_pit') {
    // 15. CIRCULAR NATURAL STONE OUTDOOR FIRE PIT & EMBERS
    const outerR = Math.min(w, d) * 0.45;
    const pitH = Math.min(h, 0.45);
    const stoneMat = partMats?.pot || new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });

    // Outer stone masonry ring
    const ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(outerR, outerR * 0.95, pitH, 24), stoneMat);
    ringMesh.position.set(0, pitH / 2, 0);
    ringMesh.castShadow = true;
    ringMesh.userData = { partId: 'pot' };
    group.add(ringMesh);

    // Sunken interior charcoal / lava rock bed
    const lavaMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
    const lavaBed = new THREE.Mesh(new THREE.CylinderGeometry(outerR * 0.72, outerR * 0.72, 0.08, 18), lavaMat);
    lavaBed.position.set(0, pitH * 0.75, 0);
    group.add(lavaBed);

    // Glowing ember coals
    const emberMat = partMats?.blossoms || new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.5,
      roughness: 0.3,
    });
    for (let em = 0; em < 9; em++) {
      const eTheta = (em / 9) * Math.PI * 2;
      const eDist = outerR * (0.15 + (em % 3) * 0.15);
      const ember = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 0), emberMat);
      ember.position.set(Math.cos(eTheta) * eDist, pitH * 0.85, Math.sin(eTheta) * eDist);
      ember.userData = { partId: 'blossoms' };
      group.add(ember);
    }

    // Stylized flame tip
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(outerR * 0.22, pitH * 0.65, 8), flameMat);
    flame.position.set(0, pitH * 0.95 + (pitH * 0.65) / 2, 0);
    group.add(flame);

  } else {
    // 9. LUXURY POTTED BOTANICAL (MONSTERA / FIG / SNAKE PLANT)
    const potH = h * 0.32;
    const potR = Math.min(w, d) * 0.32;
    const potGeom = new THREE.CylinderGeometry(potR, potR * 0.82, potH, 20);
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.set(0, potH / 2 + 0.08, 0);
    pot.castShadow = true;
    group.add(pot);

    const standMat = new THREE.MeshStandardMaterial({ color: 0x3d2616, roughness: 0.6 });
    for (let l = 0; l < 4; l++) {
      const lt = (l * Math.PI) / 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, potH * 0.85, 8), standMat);
      leg.position.set(Math.cos(lt) * (potR + 0.012), potH * 0.42, Math.sin(lt) * (potR + 0.012));
      group.add(leg);
    }

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.95, potR * 0.95, 0.02, 16), soilMat);
    soil.position.set(0, potH + 0.07, 0);
    group.add(soil);

    if (type === 'potted_snake') {
      for (let s = 0; s < 8; s++) {
        const st = (s / 8) * Math.PI * 2;
        const spearH = (h - potH) * (0.6 + (s % 3) * 0.15);
        const spearG = new THREE.ConeGeometry(0.04, spearH, 4);
        spearG.scale(1, 1, 0.25);
        const spearM = new THREE.Mesh(spearG, foliageMat);
        spearM.position.set(Math.cos(st) * potR * 0.45, potH + 0.08 + spearH / 2, Math.sin(st) * potR * 0.45);
        spearM.rotation.y = st;
        spearM.rotation.z = (Math.random() - 0.5) * 0.12;
        spearM.castShadow = true;
        group.add(spearM);
      }
    } else {
      const leafCount = 9;
      for (let lf = 0; lf < leafCount; lf++) {
        const lt = (lf / leafCount) * Math.PI * 2;
        const leafStemLen = (h - potH) * 0.5;
        const leafStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, leafStemLen, 6), trunkMat);
        leafStem.position.set(Math.cos(lt) * potR * 0.35, potH + 0.08 + leafStemLen / 2, Math.sin(lt) * potR * 0.35);
        leafStem.rotation.x = Math.sin(lt) * 0.35;
        leafStem.rotation.z = -Math.cos(lt) * 0.35;
        group.add(leafStem);

        const leafPlate = new THREE.Mesh(new THREE.SphereGeometry(potR * 0.8, 8, 8), foliageMat);
        leafPlate.scale.set(1, 0.05, 1.4);
        leafPlate.position.set(Math.cos(lt) * potR * 0.8, potH + 0.08 + leafStemLen + (lf % 3) * 0.06, Math.sin(lt) * potR * 0.8);
        leafPlate.rotation.set(0.3, lt, 0.2);
        leafPlate.castShadow = true;
        group.add(leafPlate);
      }
    }
  }

  return group;
}

export interface StairsParams {
  type?:
    | 'straight'
    | 'open_riser'
    | 'floating'
    | 'l_shape'
    | 'spiral'
    | 'outdoor_concrete'
    | 'outdoor_deck'
    | 'outdoor_metal';
  width: number;
  depth: number;
  height: number;
  stepsCount?: number;
  hasHandrail?: boolean;
  handrailSide?: 'both' | 'left' | 'right';
  railingStyle?: 'glass' | 'cable_wire' | 'spindles' | 'wrought_iron' | 'timber_pickets' | 'pipe';
  closedRisers?: boolean;
}

export function buildStairsMeshGroup(
  params: StairsParams,
  mat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const group = new THREE.Group();

  // Primary material mapping with architectural fallbacks
  const treadsMat = partMats?.treads || mat;
  const stringersMat =
    partMats?.stringers ||
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.35 });
  const handrailMat = partMats?.handrail || stringersMat;

  // Architectural specialized materials
  const glassBalustradeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    opacity: 0.38,
    transparent: true,
    roughness: 0.05,
    metalness: 0.1,
  });

  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.88,
    metalness: 0.02,
  });

  const stoneTreadMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.72,
    metalness: 0.04,
  });

  const wroughtIronMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.35,
    metalness: 0.82,
  });

  const deckTimberMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.65,
    metalness: 0.05,
  });

  const stepLedMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: new THREE.Color(0xfde047),
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });

  const cableWireMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  const riserBoardMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
    metalness: 0.02,
  });

  const w = Math.max(60, params.width) * CM;
  const d = Math.max(100, params.depth) * CM;
  const h = Math.max(120, params.height) * CM;
  const steps = params.stepsCount || 14;
  const hasHandrail = params.hasHandrail !== false;
  const handrailSide = params.handrailSide || 'right';

  const stepRise = h / steps;
  const stepRun = d / steps;

  // ----------------------------------------------------
  // 1. DUPLEX SPIRAL / HELICAL STAIRCASE
  // ----------------------------------------------------
  if (params.type === 'spiral') {
    const centerRadius = 0.08;
    const colGeom = new THREE.CylinderGeometry(centerRadius, centerRadius, h, 24);
    const colMesh = new THREE.Mesh(colGeom, stringersMat);
    colMesh.position.y = h / 2;
    colMesh.castShadow = true;
    colMesh.userData = { partId: 'stringers' };
    group.add(colMesh);

    const outerRadius = Math.min(w, d) / 2;
    const totalRotation = Math.PI * 1.6;
    const angleStep = totalRotation / steps;

    for (let i = 0; i < steps; i++) {
      const stepAngle = i * angleStep;
      const stepY = i * stepRise + stepRise / 2;

      // Wedge shaped wooden tread
      const treadGeom = new THREE.BoxGeometry(outerRadius, 0.038, 0.24);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(
        Math.cos(stepAngle) * (outerRadius / 2),
        stepY,
        Math.sin(stepAngle) * (outerRadius / 2)
      );
      treadMesh.rotation.y = -stepAngle;
      treadMesh.castShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);

      // Helical outer baluster spindle
      if (hasHandrail) {
        const balH = 0.9;
        const balGeom = new THREE.CylinderGeometry(0.009, 0.009, balH, 8);
        const balMesh = new THREE.Mesh(balGeom, handrailMat);
        balMesh.position.set(
          Math.cos(stepAngle) * (outerRadius - 0.025),
          stepY + balH / 2,
          Math.sin(stepAngle) * (outerRadius - 0.025)
        );
        balMesh.userData = { partId: 'handrail' };
        group.add(balMesh);

        // Segmented continuous handrail connecting to next step
        if (i < steps - 1) {
          const nextAngle = (i + 1) * angleStep;
          const nextY = (i + 1) * stepRise + stepRise / 2;
          const p1 = new THREE.Vector3(
            Math.cos(stepAngle) * (outerRadius - 0.025),
            stepY + balH,
            Math.sin(stepAngle) * (outerRadius - 0.025)
          );
          const p2 = new THREE.Vector3(
            Math.cos(nextAngle) * (outerRadius - 0.025),
            nextY + balH,
            Math.sin(nextAngle) * (outerRadius - 0.025)
          );
          const railVec = p2.clone().sub(p1);
          const segLen = railVec.length();
          const railSegGeom = new THREE.CylinderGeometry(0.018, 0.018, segLen, 8);
          const railSegMesh = new THREE.Mesh(railSegGeom, handrailMat);
          railSegMesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
          railSegMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), railVec.normalize());
          group.add(railSegMesh);
        }
      }
    }
  }

  // ----------------------------------------------------
  // 2. DUPLEX LUXURY FLOATING CANTILEVERED STAIRCASE
  // ----------------------------------------------------
  else if (params.type === 'floating') {
    const treadThick = 0.065; // 6.5cm thick solid oak cantilever block
    const treadDepth = stepRun * 1.15;

    // Structural wall mounting spine plate on the left wall side
    const beamLen = Math.hypot(d, h);
    const beamAngle = Math.atan2(h, d);
    const wallPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.22, beamLen),
      stringersMat
    );
    wallPlate.position.set(-w / 2 + 0.015, h / 2, 0);
    wallPlate.rotation.x = beamAngle;
    wallPlate.userData = { partId: 'stringers' };
    group.add(wallPlate);

    for (let i = 0; i < steps; i++) {
      const zPos = -d / 2 + i * stepRun + stepRun / 2;
      const yPos = (i + 1) * stepRise;

      // Solid cantilever oak tread
      const treadGeom = new THREE.BoxGeometry(w - 0.04, treadThick, treadDepth);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(0.01, yPos - treadThick / 2, zPos);
      treadMesh.castShadow = true;
      treadMesh.receiveShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);

      // Warm LED light strip embedded beneath front nose of each tread
      const ledGeom = new THREE.BoxGeometry(w * 0.88, 0.008, 0.018);
      const ledMesh = new THREE.Mesh(ledGeom, stepLedMat);
      ledMesh.position.set(0.01, yPos - treadThick - 0.004, zPos + treadDepth * 0.42);
      group.add(ledMesh);

      // Stainless steel standoff mounting pucks connecting to glass panel
      if (hasHandrail) {
        const puckGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.035, 16);
        const puckMesh = new THREE.Mesh(puckGeom, cableWireMat);
        puckMesh.rotation.z = Math.PI / 2;
        puckMesh.position.set(w / 2 - 0.01, yPos - treadThick / 2, zPos);
        group.add(puckMesh);
      }
    }

    // Modern Frameless Tempered Glass Balustrade & Slim Wood Handrail Cap
    if (hasHandrail) {
      const railH = 0.92;
      const glassGeom = new THREE.BoxGeometry(0.012, railH, beamLen);
      const glassMesh = new THREE.Mesh(glassGeom, glassBalustradeMat);
      glassMesh.position.set(w / 2, h / 2 + railH * 0.45, 0);
      glassMesh.rotation.x = beamAngle;
      glassMesh.userData = { partId: 'handrail' };
      group.add(glassMesh);

      // Slim top handrail channel atop the glass
      const capGeom = new THREE.BoxGeometry(0.035, 0.03, beamLen);
      const capMesh = new THREE.Mesh(capGeom, handrailMat);
      capMesh.position.set(w / 2, h / 2 + railH * 0.95, 0);
      capMesh.rotation.x = beamAngle;
      group.add(capMesh);
    }
  }

  // ----------------------------------------------------
  // 3. DUPLEX L-SHAPED STAIRCASE WITH INTERMEDIATE LANDING
  // ----------------------------------------------------
  else if (params.type === 'l_shape') {
    const flight1Steps = Math.floor(steps / 2);
    const flight2Steps = steps - flight1Steps;
    const landingH = (flight1Steps * stepRise);
    const landingSize = w; // Square resting landing platform

    // Mid-flight square landing platform at h/2
    const landingGeom = new THREE.BoxGeometry(landingSize, 0.045, landingSize);
    const landingMesh = new THREE.Mesh(landingGeom, treadsMat);
    landingMesh.position.set(0, landingH - 0.022, d / 2 - landingSize / 2);
    landingMesh.castShadow = true;
    landingMesh.receiveShadow = true;
    landingMesh.userData = { partId: 'treads' };
    group.add(landingMesh);

    // Landing apron / support fascia
    const apronGeom = new THREE.BoxGeometry(landingSize, landingH, landingSize);
    const apronMesh = new THREE.Mesh(apronGeom, riserBoardMat);
    apronMesh.position.set(0, landingH / 2 - 0.045, d / 2 - landingSize / 2);
    apronMesh.userData = { partId: 'stringers' };
    group.add(apronMesh);

    // Flight 1 (Lower Flight): climbs forward along Z to landing
    const f1Run = (d - landingSize) / flight1Steps;
    for (let i = 0; i < flight1Steps; i++) {
      const zPos = -d / 2 + i * f1Run + f1Run / 2;
      const yPos = (i + 1) * stepRise;

      // Closed riser
      const riserGeom = new THREE.BoxGeometry(w - 0.04, stepRise, 0.02);
      const riserMesh = new THREE.Mesh(riserGeom, riserBoardMat);
      riserMesh.position.set(0, yPos - stepRise / 2, zPos - f1Run / 2);
      group.add(riserMesh);

      // Wood tread
      const treadGeom = new THREE.BoxGeometry(w, 0.038, f1Run * 1.15);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(0, yPos - 0.019, zPos);
      treadMesh.castShadow = true;
      group.add(treadMesh);
    }

    // Flight 2 (Upper Flight): climbs from landing to top
    const f2Rise = (h - landingH) / flight2Steps;
    const f2Run = (w) / flight2Steps;
    for (let i = 0; i < flight2Steps; i++) {
      const xPos = -w / 2 + (i + 0.5) * f2Run;
      const yPos = landingH + (i + 1) * f2Rise;

      const riserGeom = new THREE.BoxGeometry(0.02, f2Rise, landingSize - 0.04);
      const riserMesh = new THREE.Mesh(riserGeom, riserBoardMat);
      riserMesh.position.set(xPos - f2Run / 2, yPos - f2Rise / 2, d / 2 - landingSize / 2);
      group.add(riserMesh);

      const treadGeom = new THREE.BoxGeometry(f2Run * 1.15, 0.038, landingSize);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(xPos, yPos - 0.019, d / 2 - landingSize / 2);
      treadMesh.castShadow = true;
      group.add(treadMesh);
    }

    // Stately Newel Posts & Classic Balustrade
    if (hasHandrail) {
      const newelH = 1.05;
      const newelW = 0.075;
      const newelGeom = new THREE.BoxGeometry(newelW, newelH, newelW);

      // Post 1: Bottom start
      const newel1 = new THREE.Mesh(newelGeom, handrailMat);
      newel1.position.set(w / 2 - newelW / 2, newelH / 2, -d / 2);
      group.add(newel1);

      // Post 2: Landing corner
      const newel2 = new THREE.Mesh(new THREE.BoxGeometry(newelW, newelH + landingH, newelW), handrailMat);
      newel2.position.set(w / 2 - newelW / 2, (newelH + landingH) / 2, d / 2 - landingSize);
      group.add(newel2);

      // Post 3: Top flight landing
      const newel3 = new THREE.Mesh(newelGeom, handrailMat);
      newel3.position.set(w / 2, h + newelH / 2, d / 2);
      group.add(newel3);
    }
  }

  // ----------------------------------------------------
  // 4. NORMAL HOUSE OUTSIDE: SOLID MASONRY / STONE STEPS
  // ----------------------------------------------------
  else if (params.type === 'outdoor_concrete') {
    const curbW = 0.12; // 12cm thick side masonry cheek walls
    const treadDepth = stepRun * 1.18; // Overhanging bullnose stone tread

    // Left and Right Stepped Stone Cheek Walls / Parapets
    const cheekGeomL = new THREE.BoxGeometry(curbW, h + 0.15, d);
    const cheekMeshL = new THREE.Mesh(cheekGeomL, concreteMat);
    cheekMeshL.position.set(-w / 2 + curbW / 2, (h + 0.15) / 2, 0);
    cheekMeshL.castShadow = true;
    cheekMeshL.userData = { partId: 'stringers' };
    group.add(cheekMeshL);

    const cheekMeshR = new THREE.Mesh(cheekGeomL, concreteMat);
    cheekMeshR.position.set(w / 2 - curbW / 2, (h + 0.15) / 2, 0);
    cheekMeshR.castShadow = true;
    cheekMeshR.userData = { partId: 'stringers' };
    group.add(cheekMeshR);

    // Solid Tiered Concrete Masonry Foundation & Limestone Slabs
    const innerW = w - curbW * 2;
    for (let i = 0; i < steps; i++) {
      const zPos = -d / 2 + i * stepRun + stepRun / 2;
      const yStepTop = (i + 1) * stepRise;

      // Solid concrete riser block extending down to ground (y=0)
      const solidBlockH = yStepTop - 0.045;
      const blockGeom = new THREE.BoxGeometry(innerW, solidBlockH, stepRun);
      const blockMesh = new THREE.Mesh(blockGeom, concreteMat);
      blockMesh.position.set(0, solidBlockH / 2, zPos);
      blockMesh.castShadow = true;
      blockMesh.receiveShadow = true;
      blockMesh.userData = { partId: 'stringers' };
      group.add(blockMesh);

      // Heavy 4.5cm limestone tread slab with bullnose nosing overhang
      const stoneTreadGeom = new THREE.BoxGeometry(innerW + 0.02, 0.045, treadDepth);
      const stoneTreadMesh = new THREE.Mesh(stoneTreadGeom, stoneTreadMat);
      stoneTreadMesh.position.set(0, yStepTop - 0.0225, zPos + 0.015);
      stoneTreadMesh.castShadow = true;
      stoneTreadMesh.receiveShadow = true;
      stoneTreadMesh.userData = { partId: 'treads' };
      group.add(stoneTreadMesh);
    }

    // Classic Exterior Wrought-Iron Balustrade
    if (hasHandrail) {
      const beamLen = Math.hypot(d, h);
      const beamAngle = Math.atan2(h, d);
      const railH = 0.88;

      // Molded black wrought-iron handrail
      const ironRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.04, beamLen),
        wroughtIronMat
      );
      ironRail.position.set(w / 2 - curbW / 2, h / 2 + railH + 0.05, 0);
      ironRail.rotation.x = beamAngle;
      ironRail.userData = { partId: 'handrail' };
      group.add(ironRail);

      // Bottom ornamental square iron newel post
      const newelBottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, railH + 0.15, 0.045),
        wroughtIronMat
      );
      newelBottom.position.set(w / 2 - curbW / 2, (railH + 0.15) / 2, -d / 2 + stepRun / 2);
      group.add(newelBottom);

      // Top iron newel post
      const newelTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, railH + 0.15, 0.045),
        wroughtIronMat
      );
      newelTop.position.set(w / 2 - curbW / 2, h + (railH + 0.15) / 2, d / 2 - stepRun / 2);
      group.add(newelTop);

      // Vertical square wrought-iron pickets every 12cm
      const picketCount = Math.max(4, Math.floor(steps * 1.5));
      for (let p = 0; p < picketCount; p++) {
        const frac = (p + 0.5) / picketCount;
        const pz = -d / 2 + frac * d;
        const py = frac * h;
        const picket = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, railH, 0.014),
          wroughtIronMat
        );
        picket.position.set(w / 2 - curbW / 2, py + railH / 2 + 0.04, pz);
        group.add(picket);
      }
    }
  }

  // ----------------------------------------------------
  // 5. NORMAL HOUSE OUTSIDE: TIMBER PORCH & DECK FLIGHT
  // ----------------------------------------------------
  else if (params.type === 'outdoor_deck') {
    const stringerThick = 0.045;
    const beamLen = Math.hypot(d, h);
    const beamAngle = Math.atan2(h, d);

    // Left, Right & Center Notched Timber Carriage Stringers
    const stringerPositions = [-w / 2 + stringerThick, w / 2 - stringerThick];
    if (w > 0.9) stringerPositions.push(0);

    stringerPositions.forEach((xPos) => {
      const stringerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stringerThick, 0.22, beamLen),
        deckTimberMat
      );
      stringerMesh.position.set(xPos, h / 2 - 0.04, 0);
      stringerMesh.rotation.x = beamAngle;
      stringerMesh.userData = { partId: 'stringers' };
      group.add(stringerMesh);
    });

    // 2x6 Deck Plank Treads (twin planks per step with drainage expansion gap)
    const plankW = (stepRun * 1.1) / 2 - 0.005;
    for (let i = 0; i < steps; i++) {
      const zCenter = -d / 2 + i * stepRun + stepRun / 2;
      const yPos = (i + 1) * stepRise;

      // Front plank
      const plank1 = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.038, plankW),
        deckTimberMat
      );
      plank1.position.set(0, yPos - 0.019, zCenter + plankW / 2 + 0.003);
      plank1.castShadow = true;
      plank1.receiveShadow = true;
      plank1.userData = { partId: 'treads' };
      group.add(plank1);

      // Rear plank
      const plank2 = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.038, plankW),
        deckTimberMat
      );
      plank2.position.set(0, yPos - 0.019, zCenter - plankW / 2 - 0.003);
      plank2.castShadow = true;
      plank2.receiveShadow = true;
      plank2.userData = { partId: 'treads' };
      group.add(plank2);

      // Deck closed riser face
      const riserMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w - stringerThick * 2, stepRise - 0.038, 0.02),
        deckTimberMat
      );
      riserMesh.position.set(0, yPos - (stepRise - 0.038) / 2 - 0.038, zCenter - stepRun / 2);
      group.add(riserMesh);
    }

    // Heavy 4x4 Deck Posts & Square Pickets
    if (hasHandrail) {
      const postW = 0.085; // 4x4 timber post
      const railH = 0.92;

      // Bottom and Top 4x4 Deck Posts with Pyramidal Chamfered Tops
      const postGeom = new THREE.BoxGeometry(postW, railH + 0.15, postW);
      const postBottom = new THREE.Mesh(postGeom, deckTimberMat);
      postBottom.position.set(w / 2, (railH + 0.15) / 2, -d / 2);
      group.add(postBottom);

      const postTop = new THREE.Mesh(postGeom, deckTimberMat);
      postTop.position.set(w / 2, h + (railH + 0.15) / 2, d / 2);
      group.add(postTop);

      // Heavy 2x4 Top Handrail Cap
      const capRail = new THREE.Mesh(
        new THREE.BoxGeometry(postW, 0.045, beamLen),
        deckTimberMat
      );
      capRail.position.set(w / 2, h / 2 + railH, 0);
      capRail.rotation.x = beamAngle;
      capRail.userData = { partId: 'handrail' };
      group.add(capRail);

      // Sub-rail underneath
      const subRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.035, beamLen),
        deckTimberMat
      );
      subRail.position.set(w / 2, h / 2 + railH - 0.05, 0);
      subRail.rotation.x = beamAngle;
      group.add(subRail);

      // Bottom rail
      const btmRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.035, beamLen),
        deckTimberMat
      );
      btmRail.position.set(w / 2, h / 2 + 0.12, 0);
      btmRail.rotation.x = beamAngle;
      group.add(btmRail);

      // Vertical 2x2 Square Deck Pickets
      const picketCount = Math.max(5, Math.floor(steps * 1.6));
      for (let p = 0; p < picketCount; p++) {
        const frac = (p + 0.5) / picketCount;
        const pz = -d / 2 + frac * d;
        const py = frac * h;
        const picket = new THREE.Mesh(
          new THREE.BoxGeometry(0.035, railH - 0.22, 0.035),
          deckTimberMat
        );
        picket.position.set(w / 2, py + (railH + 0.12) / 2, pz);
        group.add(picket);
      }
    }
  }

  // ----------------------------------------------------
  // 6. EXTERIOR INDUSTRIAL METAL / FIRE ESCAPE FLIGHT
  // ----------------------------------------------------
  else if (params.type === 'outdoor_metal') {
    const stringerThick = 0.04;
    const beamLen = Math.hypot(d, h);
    const beamAngle = Math.atan2(h, d);

    // Galvanized Steel C-Channel Stringers
    const leftStringer = new THREE.Mesh(
      new THREE.BoxGeometry(stringerThick, 0.18, beamLen),
      stringersMat
    );
    leftStringer.position.set(-w / 2 + stringerThick / 2, h / 2, 0);
    leftStringer.rotation.x = beamAngle;
    leftStringer.userData = { partId: 'stringers' };
    group.add(leftStringer);

    const rightStringer = new THREE.Mesh(
      new THREE.BoxGeometry(stringerThick, 0.18, beamLen),
      stringersMat
    );
    rightStringer.position.set(w / 2 - stringerThick / 2, h / 2, 0);
    rightStringer.rotation.x = beamAngle;
    rightStringer.userData = { partId: 'stringers' };
    group.add(rightStringer);

    // Perforated Anti-Slip Steel Treads
    for (let i = 0; i < steps; i++) {
      const zPos = -d / 2 + i * stepRun + stepRun / 2;
      const yPos = (i + 1) * stepRise;

      const treadMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w - stringerThick * 2, 0.03, stepRun * 1.1),
        cableWireMat
      );
      treadMesh.position.set(0, yPos - 0.015, zPos);
      treadMesh.castShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);
    }

    // Double Pipe Safety Guardrails on Both Sides
    if (hasHandrail) {
      const railH = 0.95;
      [-w / 2, w / 2].forEach((xSide) => {
        // Top pipe grab rail
        const topPipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.022, beamLen, 12),
          stringersMat
        );
        topPipe.position.set(xSide, h / 2 + railH, 0);
        topPipe.rotation.x = beamAngle;
        topPipe.userData = { partId: 'handrail' };
        group.add(topPipe);

        // Mid-height safety knee rail
        const midPipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, beamLen, 12),
          stringersMat
        );
        midPipe.position.set(xSide, h / 2 + railH * 0.5, 0);
        midPipe.rotation.x = beamAngle;
        group.add(midPipe);

        // Pipe stanchion posts
        for (let p = 0; p <= 3; p++) {
          const frac = p / 3;
          const pz = -d / 2 + frac * d;
          const py = frac * h;
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, railH, 12),
            stringersMat
          );
          post.position.set(xSide, py + railH / 2, pz);
          group.add(post);
        }
      });
    }
  }

  // ----------------------------------------------------
  // 7. DUPLEX ARCHITECTURAL OPEN-RISER HARDWOOD & STEEL
  // ----------------------------------------------------
  else {
    // Default: 'open_riser' / 'straight'
    const stringerThick = 0.045;
    const beamLen = Math.hypot(d, h);
    const beamAngle = Math.atan2(h, d);

    // Architectural Matte Black Steel Channel Stringers
    const leftBeam = new THREE.Mesh(
      new THREE.BoxGeometry(stringerThick, 0.18, beamLen),
      stringersMat
    );
    leftBeam.position.set(-w / 2 + stringerThick / 2, h / 2, 0);
    leftBeam.rotation.x = beamAngle;
    leftBeam.userData = { partId: 'stringers' };
    group.add(leftBeam);

    const rightBeam = new THREE.Mesh(
      new THREE.BoxGeometry(stringerThick, 0.18, beamLen),
      stringersMat
    );
    rightBeam.position.set(w / 2 - stringerThick / 2, h / 2, 0);
    rightBeam.rotation.x = beamAngle;
    rightBeam.userData = { partId: 'stringers' };
    group.add(rightBeam);

    // Solid 4.5cm Beveled Hardwood Treads with Open Risers
    for (let i = 0; i < steps; i++) {
      const zPos = -d / 2 + i * stepRun + stepRun / 2;
      const yPos = (i + 1) * stepRise;

      const treadGeom = new THREE.BoxGeometry(w - stringerThick * 2, 0.045, stepRun * 1.15);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(0, yPos - 0.0225, zPos);
      treadMesh.castShadow = true;
      treadMesh.receiveShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);
    }

    // Modern Stainless Tension Cable Wire Railing & Solid Wood Handrail
    if (hasHandrail) {
      const railH = 0.9;
      const railX = handrailSide === 'left' ? -w / 2 : w / 2;

      // Ergonomic round wood handrail
      const handrailGeom = new THREE.CylinderGeometry(0.026, 0.026, beamLen, 16);
      const handrailMesh = new THREE.Mesh(handrailGeom, handrailMat);
      handrailMesh.position.set(railX, h / 2 + railH, 0);
      handrailMesh.rotation.x = beamAngle;
      handrailMesh.userData = { partId: 'handrail' };
      group.add(handrailMesh);

      // Stainless Steel Tension Cables (4 parallel horizontal safety cables)
      for (let c = 1; c <= 4; c++) {
        const wireH = (railH * c) / 5;
        const cableMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.003, 0.003, beamLen, 8),
          cableWireMat
        );
        cableMesh.position.set(railX, h / 2 + wireH, 0);
        cableMesh.rotation.x = beamAngle;
        group.add(cableMesh);
      }

      // Vertical Steel Stanchion Posts
      const postCount = 4;
      for (let p = 0; p < postCount; p++) {
        const frac = p / (postCount - 1);
        const pz = -d / 2 + frac * d;
        const py = frac * h;
        const postGeom = new THREE.BoxGeometry(0.03, railH, 0.03);
        const postMesh = new THREE.Mesh(postGeom, stringersMat);
        postMesh.position.set(railX, py + railH / 2, pz);
        postMesh.userData = { partId: 'handrail' };
        group.add(postMesh);
      }
    }
  }

  return group;
}

// ----------------------------------------------------
// TV UNIT & FLAT SCREEN TELEVISION
// ----------------------------------------------------
export function buildTvUnitMeshGroup(
  wCm: number,
  dCm: number,
  hCm: number,
  mat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(80, wCm) * CM;
  const d = Math.max(35, dCm) * CM;
  const totalH = Math.max(60, hCm) * CM;
  const consoleH = Math.min(0.45, totalH * 0.45);
  const woodMat = partMats?.frame || mat;
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    roughness: 0.05,
    metalness: 0.85,
  });
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.4,
    metalness: 0.8,
  });

  // 1. Lower Console Credenza / Cabinet
  const consoleGeom = createRoundedBoxGeometry(w, consoleH, d, 0.02);
  const consoleMesh = new THREE.Mesh(consoleGeom, woodMat);
  consoleMesh.position.set(0, consoleH / 2 + 0.1, 0);
  consoleMesh.castShadow = true;
  consoleMesh.receiveShadow = true;
  group.add(consoleMesh);

  // Console Legs (4 tapered metal legs)
  const legH = 0.1;
  const legR = 0.018;
  const offX = w / 2 - 0.08;
  const offZ = d / 2 - 0.08;
  [[-offX, -offZ], [offX, -offZ], [-offX, offZ], [offX, offZ]].forEach(([lx, lz]) => {
    const legGeom = new THREE.CylinderGeometry(legR * 0.8, legR * 0.5, legH, 16);
    const leg = new THREE.Mesh(legGeom, chromeMat);
    leg.position.set(lx, legH / 2, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  // Front Drawer dividing line & sleek pull bars
  const pullGeom = createRoundedBoxGeometry(w * 0.28, 0.012, 0.015, 0.003);
  [-w * 0.22, w * 0.22].forEach((px) => {
    const pull = new THREE.Mesh(pullGeom, brassCapMat);
    pull.position.set(px, consoleH / 2 + 0.1, d / 2 + 0.008);
    group.add(pull);
  });

  // 2. Flat-Screen Smart LED TV on top of console
  const tvW = Math.min(w * 0.85, 1.4);
  const tvH = tvW * 0.58; // 16:9 ratio
  const tvY = consoleH + 0.1 + 0.04;

  // TV Stand Base Pedestal
  const standBaseGeom = createRoundedBoxGeometry(tvW * 0.35, 0.012, 0.18, 0.01);
  const standBase = new THREE.Mesh(standBaseGeom, bezelMat);
  standBase.position.set(0, consoleH + 0.1 + 0.006, 0);
  group.add(standBase);

  // TV Stand Neck Riser
  const neckGeom = new THREE.BoxGeometry(0.06, 0.04, 0.03);
  const neck = new THREE.Mesh(neckGeom, bezelMat);
  neck.position.set(0, consoleH + 0.1 + 0.025, 0);
  group.add(neck);

  // TV Bezel Frame
  const tvFrameGeom = createRoundedBoxGeometry(tvW, tvH, 0.025, 0.01);
  const tvFrame = new THREE.Mesh(tvFrameGeom, bezelMat);
  tvFrame.position.set(0, tvY + tvH / 2, 0);
  tvFrame.castShadow = true;
  group.add(tvFrame);

  // TV High-Gloss Glass Screen
  const tvScreenGeom = new THREE.PlaneGeometry(tvW - 0.04, tvH - 0.04);
  const tvScreen = new THREE.Mesh(tvScreenGeom, screenMat);
  tvScreen.position.set(0, tvY + tvH / 2, 0.014);
  group.add(tvScreen);

  // Power LED glow dot (subtle blue dot)
  const ledGeom = new THREE.SphereGeometry(0.004, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const led = new THREE.Mesh(ledGeom, ledMat);
  led.position.set(0, tvY + 0.012, 0.015);
  group.add(led);

  return group;
}

// ----------------------------------------------------
// WALL HEATING RADIATOR
// ----------------------------------------------------
export function buildRadiatorMeshGroup(
  wCm: number,
  dCm: number,
  hCm: number
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(40, wCm) * CM;
  const d = Math.max(8, dCm) * CM;
  const h = Math.max(40, hCm) * CM;

  const whiteEnamelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.1,
  });

  // Vertical Heating Columns (Fins)
  const numFins = Math.max(6, Math.floor(w / 0.06));
  const finW = 0.045;
  const finD = d * 0.85;
  const finH = h - 0.08;

  for (let i = 0; i < numFins; i++) {
    const x = -w / 2 + finW / 2 + (i / (numFins - 1)) * (w - finW);
    const finGeom = createRoundedBoxGeometry(finW * 0.85, finH, finD, 0.01);
    const finMesh = new THREE.Mesh(finGeom, whiteEnamelMat);
    finMesh.position.set(x, h / 2, 0);
    finMesh.castShadow = true;
    group.add(finMesh);
  }

  // Top and Bottom Horizontal Manifold Pipes
  const pipeR = 0.016;
  const pipeGeom = new THREE.CylinderGeometry(pipeR, pipeR, w, 16);
  pipeGeom.rotateZ(Math.PI / 2);

  const topPipe = new THREE.Mesh(pipeGeom, whiteEnamelMat);
  topPipe.position.set(0, h - 0.04, 0);
  group.add(topPipe);

  const btmPipe = new THREE.Mesh(pipeGeom, whiteEnamelMat);
  btmPipe.position.set(0, 0.04, 0);
  group.add(btmPipe);

  // Chrome Thermostatic Valve Knob on side
  const valveGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 16);
  valveGeom.rotateZ(Math.PI / 2);
  const valve = new THREE.Mesh(valveGeom, chromeMat);
  valve.position.set(w / 2 + 0.025, h - 0.04, 0);
  group.add(valve);

  return group;
}

// ----------------------------------------------------
// KITCHEN STOVE / INDUCTION RANGE COOKER
// ----------------------------------------------------
export function buildCookerMeshGroup(
  wCm: number,
  dCm: number,
  hCm: number
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(50, wCm) * CM;
  const d = Math.max(50, dCm) * CM;
  const h = Math.max(70, hCm) * CM;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.15 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.85 });
  const glassCooktopMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.08, metalness: 0.8 });
  const ovenGlassMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.1, metalness: 0.5 });

  // Main Range Body
  const bodyGeom = createRoundedBoxGeometry(w, h, d, 0.015);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, h / 2, 0);
  body.castShadow = true;
  group.add(body);

  // Black Ceramic Induction Glass Top
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.015, d * 0.96), glassCooktopMat);
  topPlate.position.set(0, h + 0.0075, 0);
  group.add(topPlate);

  // 4 Induction Cooking Burner Rings
  const burnerR1 = Math.min(w, d) * 0.16;
  const burnerR2 = Math.min(w, d) * 0.12;
  const offX = w * 0.24;
  const offZ = d * 0.24;
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });

  [
    [-offX, -offZ, burnerR1],
    [offX, -offZ, burnerR2],
    [-offX, offZ, burnerR2],
    [offX, offZ, burnerR1],
  ].forEach(([bx, bz, r]) => {
    const ringGeom = new THREE.RingGeometry(r * 0.8, r, 24);
    ringGeom.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(bx, h + 0.016, bz);
    group.add(ring);
  });

  // Front Control Panel with 4 Knobs
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
  for (let k = 0; k < 4; k++) {
    const kx = -w * 0.3 + (k / 3) * w * 0.6;
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 16), knobMat);
    knob.rotateX(Math.PI / 2);
    knob.position.set(kx, h - 0.05, d / 2 + 0.01);
    group.add(knob);
  }

  // Oven Door with Glass Window & Handle
  const ovenW = w * 0.85;
  const ovenH = h * 0.55;
  const ovenWin = new THREE.Mesh(createRoundedBoxGeometry(ovenW, ovenH, 0.02, 0.01), ovenGlassMat);
  ovenWin.position.set(0, h * 0.42, d / 2 + 0.005);
  group.add(ovenWin);

  // Horizontal Oven Handle Bar
  const handleGeom = createRoundedBoxGeometry(ovenW * 0.75, 0.016, 0.022, 0.005);
  const handle = new THREE.Mesh(handleGeom, steelMat);
  handle.position.set(0, h * 0.64, d / 2 + 0.022);
  group.add(handle);

  return group;
}

// ----------------------------------------------------
// HOUSEHOLD ELECTRICAL APPLIANCES MESH BUILDER
// ----------------------------------------------------
export function buildApplianceMeshGroup(
  type: 'washing_machine' | 'dryer' | 'refrigerator' | 'microwave' | 'air_conditioner',
  wCm: number,
  dCm: number,
  hCm: number
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(20, wCm) * CM;
  const d = Math.max(15, dCm) * CM;
  const h = Math.max(15, hCm) * CM;

  const whiteEnamelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.15,
    metalness: 0.1,
  });
  const darkGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.05,
    metalness: 0.9,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    metalness: 0.85,
    roughness: 0.25,
  });
  const ledDisplayMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.8,
  });

  if (type === 'washing_machine' || type === 'dryer') {
    // 1. Front-loading Washing Machine / Tumble Dryer
    const bodyGeom = createRoundedBoxGeometry(w, h, d, 0.02);
    const body = new THREE.Mesh(bodyGeom, whiteEnamelMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    group.add(body);

    // Front Circular Door Bezel & Glass Drum Window
    const doorRadius = Math.min(w, h) * 0.28;
    const rimGeom = new THREE.TorusGeometry(doorRadius, 0.022, 16, 40);
    const doorRim = new THREE.Mesh(rimGeom, steelMat);
    doorRim.position.set(0, h * 0.42, d / 2 + 0.012);
    doorRim.castShadow = true;
    group.add(doorRim);

    const glassGeom = new THREE.CylinderGeometry(doorRadius * 0.88, doorRadius * 0.88, 0.015, 32);
    glassGeom.rotateX(Math.PI / 2);
    const doorGlass = new THREE.Mesh(glassGeom, darkGlassMat);
    doorGlass.position.set(0, h * 0.42, d / 2 + 0.01);
    group.add(doorGlass);

    // Top Control Panel Strip
    const panelGeom = createRoundedBoxGeometry(w * 0.94, h * 0.18, 0.01, 0.005);
    const panel = new THREE.Mesh(panelGeom, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
    panel.position.set(0, h - (h * 0.18) / 2 - 0.02, d / 2 + 0.008);
    group.add(panel);

    // Detergent Drawer on Left
    const drawerGeom = createRoundedBoxGeometry(w * 0.25, h * 0.12, 0.012, 0.004);
    const drawer = new THREE.Mesh(drawerGeom, whiteEnamelMat);
    drawer.position.set(-w * 0.28, h - (h * 0.18) / 2 - 0.02, d / 2 + 0.014);
    group.add(drawer);

    // Program Dial Knob in Center
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 20), steelMat);
    dial.rotateX(Math.PI / 2);
    dial.position.set(0, h - (h * 0.18) / 2 - 0.02, d / 2 + 0.016);
    group.add(dial);

    // Digital LED screen on Right
    const screen = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, h * 0.08, 0.005), ledDisplayMat);
    screen.position.set(w * 0.25, h - (h * 0.18) / 2 - 0.02, d / 2 + 0.015);
    group.add(screen);

  } else if (type === 'refrigerator') {
    // 2. Double-Door French / Multi-Door Refrigerator
    const bodyGeom = createRoundedBoxGeometry(w, h, d, 0.025);
    const body = new THREE.Mesh(bodyGeom, steelMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    group.add(body);

    const upperH = h * 0.62;
    const lowerH = h - upperH - 0.04;

    // Recessed Black Center Seam
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.008, upperH * 0.95, 0.008), darkGlassMat);
    seam.position.set(0, h - upperH / 2 - 0.02, d / 2 + 0.008);
    group.add(seam);

    // Long Vertical Handles (Left & Right)
    [-w * 0.06, w * 0.06].forEach((hx) => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, upperH * 0.6, 12), chromeMat);
      handle.position.set(hx, h - upperH / 2 - 0.02, d / 2 + 0.025);
      group.add(handle);
    });

    // Lower Freezer Drawer Pull Handle
    const lowerHandle = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.016, 0.02), chromeMat);
    lowerHandle.position.set(0, lowerH * 0.8, d / 2 + 0.022);
    group.add(lowerHandle);

    // Water & Ice Dispenser Recess on Left Door
    const dispGeom = createRoundedBoxGeometry(w * 0.25, h * 0.18, 0.02, 0.01);
    const dispenser = new THREE.Mesh(dispGeom, darkGlassMat);
    dispenser.position.set(-w * 0.22, h * 0.66, d / 2 + 0.005);
    group.add(dispenser);

  } else if (type === 'air_conditioner') {
    // 3. Wall Mounted Split AC Unit
    const bodyGeom = createRoundedBoxGeometry(w, h, d, Math.min(h, d) * 0.35);
    const body = new THREE.Mesh(bodyGeom, whiteEnamelMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    group.add(body);

    // Bottom Discharge Air Louver Flap
    const flapGeom = createRoundedBoxGeometry(w * 0.9, h * 0.22, 0.01, 0.005);
    const flap = new THREE.Mesh(flapGeom, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 }));
    flap.position.set(0, h * 0.18, d / 2 + 0.005);
    group.add(flap);

    // LED Temp Display (Green/Cyan 22°C Glow)
    const ledIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.004), ledDisplayMat);
    ledIndicator.position.set(w * 0.32, h * 0.55, d / 2 + 0.008);
    group.add(ledIndicator);

  } else {
    // 4. Countertop Microwave / Oven
    const bodyGeom = createRoundedBoxGeometry(w, h, d, 0.015);
    const body = new THREE.Mesh(bodyGeom, steelMat);
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    group.add(body);

    const winW = w * 0.62;
    const winH = h * 0.72;
    const windowMesh = new THREE.Mesh(createRoundedBoxGeometry(winW, winH, 0.01, 0.01), darkGlassMat);
    windowMesh.position.set(-w * 0.14, h / 2, d / 2 + 0.008);
    group.add(windowMesh);

    const keypadMesh = new THREE.Mesh(
      createRoundedBoxGeometry(w * 0.22, winH, 0.01, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    keypadMesh.position.set(w * 0.32, h / 2, d / 2 + 0.008);
    group.add(keypadMesh);

    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 16), chromeMat);
    dial.rotateX(Math.PI / 2);
    dial.position.set(w * 0.32, h * 0.35, d / 2 + 0.018);
    group.add(dial);
  }

  return group;
}

// ----------------------------------------------------
// SANITARY FIXTURES (BATH, TOILET, SINK)
// ----------------------------------------------------
export function buildSanitaryMeshGroup(
  type: 'bath' | 'toilet' | 'sink',
  wCm: number,
  dCm: number,
  hCm: number
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(30, wCm) * CM;
  const d = Math.max(30, dCm) * CM;
  const h = Math.max(30, hCm) * CM;

  const porcelainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.05,
  });

  if (type === 'bath') {
    // Luxury Bathtub with rounded rim & inner basin
    const tubGeom = createRoundedBoxGeometry(w, h, d, Math.min(w, d) * 0.25);
    const tub = new THREE.Mesh(tubGeom, porcelainMat);
    tub.position.set(0, h / 2, 0);
    tub.castShadow = true;
    group.add(tub);

    // Inner Bath Basin
    const basinMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.1 });
    const basinGeom = createRoundedBoxGeometry(w - 0.12, h * 0.85, d - 0.12, Math.min(w, d) * 0.2);
    const basin = new THREE.Mesh(basinGeom, basinMat);
    basin.position.set(0, h * 0.58, 0);
    group.add(basin);

    // Chrome Drain & Overflow
    const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.005, 16), chromeMat);
    drain.position.set(-w * 0.3, h * 0.16, 0);
    group.add(drain);

    // Chrome Mixer Tap on End Rim
    const tapSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 12), chromeMat);
    tapSpout.position.set(-w / 2 + 0.05, h + 0.045, 0);
    group.add(tapSpout);

  } else if (type === 'toilet') {
    // Water Tank at rear
    const tankW = w * 0.9;
    const tankD = d * 0.32;
    const tankH = h * 0.5;
    const tankGeom = createRoundedBoxGeometry(tankW, tankH, tankD, 0.02);
    const tank = new THREE.Mesh(tankGeom, porcelainMat);
    tank.position.set(0, h - tankH / 2, -d / 2 + tankD / 2);
    tank.castShadow = true;
    group.add(tank);

    // Dual Flush Chrome Button
    const flushBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 16), chromeMat);
    flushBtn.position.set(0, h + 0.004, -d / 2 + tankD / 2);
    group.add(flushBtn);

    // Toilet Bowl
    const bowlH = Math.min(0.42, h * 0.55);
    const bowlW = w * 0.85;
    const bowlD = d * 0.68;
    const bowlGeom = createRoundedBoxGeometry(bowlW, bowlH, bowlD, bowlW * 0.38);
    const bowl = new THREE.Mesh(bowlGeom, porcelainMat);
    bowl.position.set(0, bowlH / 2, d / 2 - bowlD / 2);
    bowl.castShadow = true;
    group.add(bowl);

    // Toilet Seat Lid Rim
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const seatGeom = createRoundedBoxGeometry(bowlW * 0.95, 0.022, bowlD * 0.95, bowlW * 0.36);
    const seat = new THREE.Mesh(seatGeom, seatMat);
    seat.position.set(0, bowlH + 0.011, d / 2 - bowlD / 2);
    group.add(seat);

  } else {
    // Sink / Washbasin with Counter
    const basinGeom = createRoundedBoxGeometry(w, h * 0.25, d, 0.03);
    const basin = new THREE.Mesh(basinGeom, porcelainMat);
    basin.position.set(0, h - h * 0.125, 0);
    basin.castShadow = true;
    group.add(basin);

    // Chrome Faucet & Spout
    const faucetGeom = new THREE.CylinderGeometry(0.012, 0.014, 0.12, 12);
    const faucet = new THREE.Mesh(faucetGeom, chromeMat);
    faucet.position.set(0, h + 0.06, -d / 2 + 0.08);
    group.add(faucet);

    const spoutGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.07, 12);
    spoutGeom.rotateX(Math.PI / 4);
    const spout = new THREE.Mesh(spoutGeom, chromeMat);
    spout.position.set(0, h + 0.1, -d / 2 + 0.11);
    group.add(spout);
  }

  return group;
}

// ----------------------------------------------------
// MODERN DESK WITH TASK STOOL
// ----------------------------------------------------
export function buildDeskMeshGroup(
  wCm: number,
  dCm: number,
  hCm: number,
  mat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(70, wCm) * CM;
  const d = Math.max(45, dCm) * CM;
  const h = Math.max(65, hCm) * CM;

  const topThick = 0.032;
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });

  // 1. Desktop Slab
  const topGeom = createRoundedBoxGeometry(w, topThick, d, 0.015);
  const topMesh = new THREE.Mesh(topGeom, mat);
  topMesh.position.set(0, h - topThick / 2, 0);
  topMesh.castShadow = true;
  group.add(topMesh);

  // 2. Minimalist Steel Frame Legs
  const legThick = 0.024;
  const legH = h - topThick;
  [-w / 2 + 0.06, w / 2 - 0.06].forEach((lx) => {
    const post1 = new THREE.Mesh(new THREE.BoxGeometry(legThick, legH, legThick), steelMat);
    post1.position.set(lx, legH / 2, -d / 2 + 0.04);
    group.add(post1);

    const post2 = new THREE.Mesh(new THREE.BoxGeometry(legThick, legH, legThick), steelMat);
    post2.position.set(lx, legH / 2, d / 2 - 0.04);
    group.add(post2);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(legThick, legThick, d - 0.08), steelMat);
    bar.position.set(lx, legThick / 2, 0);
    group.add(bar);
  });

  // Stool / Task Seat
  const stoolR = 0.16;
  const stoolH = 0.44;
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.5 }); // Lavender velvet
  const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(stoolR, stoolR, 0.05, 24), seatMat);
  stoolSeat.position.set(0, stoolH - 0.025, d * 0.28);
  stoolSeat.castShadow = true;
  group.add(stoolSeat);

  const stoolStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, stoolH - 0.05, 16), steelMat);
  stoolStem.position.set(0, (stoolH - 0.05) / 2, d * 0.28);
  group.add(stoolStem);

  const stoolBase = new THREE.Mesh(new THREE.CylinderGeometry(stoolR * 0.85, stoolR * 0.85, 0.014, 24), steelMat);
  stoolBase.position.set(0, 0.007, d * 0.28);
  group.add(stoolBase);

  return group;
}

// ----------------------------------------------------
// ARCHITECTURAL VEHICLES (SEDAN, SUV, SPORTS, EV, TRUCK, VESPA, BICYCLE)
// ----------------------------------------------------
export function buildVehicleMeshGroup(
  params: VehicleParams,
  mat: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const group = new THREE.Group();
  const type = params.type || 'sedan';

  // Sub-part materials
  const bodyMat = partMats?.body || mat || new THREE.MeshStandardMaterial({
    color: params.color || 0x1e293b,
    roughness: 0.15,
    metalness: 0.85,
  });
  const rimMat = partMats?.rims || new THREE.MeshStandardMaterial({
    color: params.rimColor || 0xe2e8f0,
    roughness: 0.1,
    metalness: 0.95,
  });
  const glassMat = partMats?.glass || new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.05,
    metalness: 0.9,
    opacity: 0.75,
    transparent: true,
  });
  const trimMat = partMats?.trim || new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.4,
    metalness: 0.6,
  });

  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 });
  const lightHeadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lightTailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // --------------------------------------------------
  // A. URBAN COMMUTER BICYCLE / ROAD BIKE
  // --------------------------------------------------
  if (type === 'bicycle' || type === 'bike') {
    const w = Math.max(45, params.width) * CM;
    const d = Math.max(160, params.depth) * CM;
    const h = Math.max(95, params.height) * CM;

    const wheelR = h * 0.35;
    const wheelThick = 0.035;
    const tireGeom = new THREE.CylinderGeometry(wheelR, wheelR, wheelThick, 24);
    tireGeom.rotateZ(Math.PI / 2);

    const rimGeom = new THREE.CylinderGeometry(wheelR * 0.85, wheelR * 0.85, wheelThick * 0.6, 20);
    rimGeom.rotateZ(Math.PI / 2);

    // Front & Rear Wheels
    [-d * 0.38, d * 0.38].forEach((wz) => {
      const tire = new THREE.Mesh(tireGeom, tireMat);
      tire.position.set(0, wheelR, wz);
      tire.castShadow = true;
      group.add(tire);

      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.position.set(0, wheelR, wz);
      rim.userData = { partId: 'rims' };
      group.add(rim);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12), rimMat);
      hub.rotateZ(Math.PI / 2);
      hub.position.set(0, wheelR, wz);
      group.add(hub);
    });

    // Tubular Diamond Bike Frame
    const tubeMat = bodyMat;
    const frameT = 0.025;

    // Bottom bracket / pedal crank hub
    const bbY = wheelR * 0.85;
    const bbZ = -d * 0.05;

    // Seat tube: from BB to seat clamp
    const seatH = h * 0.82;
    const seatTubeLen = seatH - bbY;
    const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(frameT, frameT, seatTubeLen, 8), tubeMat);
    seatTube.position.set(0, bbY + seatTubeLen / 2, bbZ);
    seatTube.rotation.x = 0.18;
    seatTube.userData = { partId: 'body' };
    group.add(seatTube);

    // Down tube: from BB to head tube
    const headY = h * 0.88;
    const headZ = d * 0.32;
    const downLen = Math.hypot(headZ - bbZ, headY - bbY);
    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(frameT, frameT, downLen, 8), tubeMat);
    downTube.position.set(0, (bbY + headY) / 2, (bbZ + headZ) / 2);
    downTube.rotation.x = Math.atan2(headZ - bbZ, headY - bbY);
    downTube.userData = { partId: 'body' };
    group.add(downTube);

    // Top tube: from seat clamp to head tube
    const topLen = Math.hypot(headZ - bbZ, headY - seatH);
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(frameT, frameT, topLen, 8), tubeMat);
    topTube.position.set(0, (seatH + headY) / 2, (bbZ + headZ) / 2);
    topTube.rotation.x = Math.atan2(headZ - bbZ, headY - seatH);
    topTube.userData = { partId: 'body' };
    group.add(topTube);

    // Handlebars & Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(frameT * 0.8, frameT * 0.8, 0.12, 8), trimMat);
    stem.position.set(0, headY + 0.05, headZ);
    group.add(stem);

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(frameT * 0.7, frameT * 0.7, w * 0.85, 12), trimMat);
    bar.rotateZ(Math.PI / 2);
    bar.position.set(0, headY + 0.1, headZ + 0.02);
    bar.userData = { partId: 'trim' };
    group.add(bar);

    // Saddle Seat
    const saddle = new THREE.Mesh(createRoundedBoxGeometry(0.14, 0.04, 0.24, 0.015), trimMat);
    saddle.position.set(0, seatH + 0.04, bbZ - 0.02);
    saddle.userData = { partId: 'trim' };
    group.add(saddle);

    return group;
  }

  // --------------------------------------------------
  // B. RETRO ITALIAN URBAN SCOOTER / VESPA
  // --------------------------------------------------
  if (type === 'vespa' || type === 'scooter') {
    const w = Math.max(65, params.width) * CM;
    const d = Math.max(170, params.depth) * CM;
    const h = Math.max(105, params.height) * CM;

    const wheelR = 0.22;
    const wheelThick = 0.08;
    const tireGeom = new THREE.CylinderGeometry(wheelR, wheelR, wheelThick, 20);
    tireGeom.rotateZ(Math.PI / 2);
    const rimGeom = new THREE.CylinderGeometry(wheelR * 0.6, wheelR * 0.6, wheelThick * 0.8, 16);
    rimGeom.rotateZ(Math.PI / 2);

    // Front & Rear Wheels
    [-d * 0.35, d * 0.35].forEach((wz) => {
      const tire = new THREE.Mesh(tireGeom, tireMat);
      tire.position.set(0, wheelR, wz);
      tire.castShadow = true;
      group.add(tire);

      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.position.set(0, wheelR, wz);
      rim.userData = { partId: 'rims' };
      group.add(rim);
    });

    // Floorboard Foot Platform
    const floorH = 0.06;
    const floorW = w * 0.75;
    const floorD = d * 0.45;
    const floorMesh = new THREE.Mesh(createRoundedBoxGeometry(floorW, floorH, floorD, 0.03), bodyMat);
    floorMesh.position.set(0, wheelR + 0.06, 0);
    floorMesh.userData = { partId: 'body' };
    group.add(floorMesh);

    // Front Curved Leg Apron Shield
    const apronW = w * 0.85;
    const apronH = h * 0.65;
    const apronGeom = createRoundedBoxGeometry(apronW, apronH, 0.04, 0.05);
    const apron = new THREE.Mesh(apronGeom, bodyMat);
    apron.position.set(0, wheelR + apronH / 2 + 0.05, d * 0.22);
    apron.rotation.x = -0.22;
    apron.castShadow = true;
    apron.userData = { partId: 'body' };
    group.add(apron);

    // Front Mudguard Fender
    const fenderGeom = new THREE.CylinderGeometry(wheelR * 1.15, wheelR * 1.15, 0.12, 16, 1, false, 0, Math.PI);
    fenderGeom.rotateZ(Math.PI / 2);
    fenderGeom.rotateX(Math.PI / 2);
    const fender = new THREE.Mesh(fenderGeom, bodyMat);
    fender.position.set(0, wheelR * 0.95, d * 0.35);
    fender.userData = { partId: 'body' };
    group.add(fender);

    // Rear Bulbous Engine Cowlings
    const rearCowling = new THREE.Mesh(createRoundedBoxGeometry(w * 0.65, h * 0.38, d * 0.45, 0.1), bodyMat);
    rearCowling.position.set(0, wheelR + (h * 0.38) / 2 + 0.04, -d * 0.22);
    rearCowling.castShadow = true;
    rearCowling.userData = { partId: 'body' };
    group.add(rearCowling);

    // Ergonomic Dual Saddle Seat
    const seatMesh = new THREE.Mesh(createRoundedBoxGeometry(w * 0.45, 0.09, d * 0.38, 0.04), trimMat);
    seatMesh.position.set(0, wheelR + h * 0.42 + 0.05, -d * 0.12);
    seatMesh.userData = { partId: 'trim' };
    group.add(seatMesh);

    // Handlebar & Round Chrome Headlight
    const barMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, w * 0.8, 12), trimMat);
    barMesh.rotateZ(Math.PI / 2);
    barMesh.position.set(0, h * 0.88, d * 0.25);
    barMesh.userData = { partId: 'trim' };
    group.add(barMesh);

    const headLight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), lightHeadMat);
    headLight.rotateX(Math.PI / 2);
    headLight.position.set(0, h * 0.88, d * 0.28);
    group.add(headLight);

    // Tail light
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.03), lightTailMat);
    tailLight.position.set(0, wheelR + h * 0.35, -d * 0.44);
    group.add(tailLight);

    return group;
  }

  // --------------------------------------------------
  // C. FULL-SCALE AUTOMOBILES: SEDAN, SUV, SPORTS, EV, TRUCK
  // --------------------------------------------------
  const w = Math.max(160, params.width) * CM;
  const d = Math.max(380, params.depth) * CM;
  const h = Math.max(125, params.height) * CM;

  const isSUV = type === 'suv';
  const isSports = type === 'sports' || type === 'coupe';
  const isEV = type === 'ev';
  const isTruck = type === 'truck' || type === 'pickup';

  // Ground clearance
  const groundClearance = isSUV || isTruck ? 0.28 : (isSports ? 0.12 : 0.18);
  const wheelR = isSUV || isTruck ? 0.38 : (isSports ? 0.32 : 0.32);
  const wheelThick = isSUV || isTruck ? 0.26 : 0.22;

  // 1. Lower Chassis / Unibody
  const chassisH = h * (isSports ? 0.48 : (isSUV ? 0.42 : 0.45));
  const chassisGeom = createRoundedBoxGeometry(w, chassisH, d, isSports ? 0.16 : 0.1);
  const chassis = new THREE.Mesh(chassisGeom, bodyMat);
  chassis.position.set(0, chassisH / 2 + groundClearance, 0);
  chassis.castShadow = true;
  chassis.userData = { partId: 'body' };
  group.add(chassis);

  // 2. Cabin Greenhouse / Glass Windows
  if (isTruck) {
    // Pickup: Cab only in front half, open cargo bed in rear half
    const cabW = w * 0.9;
    const cabD = d * 0.48;
    const cabH = h * 0.45;
    const cabGeom = createRoundedBoxGeometry(cabW, cabH, cabD, 0.08);
    const cab = new THREE.Mesh(cabGeom, glassMat);
    cab.position.set(0, chassisH + cabH / 2 + groundClearance - 0.02, d * 0.08);
    cab.castShadow = true;
    cab.userData = { partId: 'glass' };
    group.add(cab);

    // Cab Roof
    const roofGeom = createRoundedBoxGeometry(cabW * 0.96, 0.04, cabD * 0.8, 0.04);
    const roof = new THREE.Mesh(roofGeom, bodyMat);
    roof.position.set(0, chassisH + cabH + groundClearance - 0.01, d * 0.08);
    roof.userData = { partId: 'body' };
    group.add(roof);

    // Open Rear Cargo Bed Liner
    const bedW = w * 0.86;
    const bedD = d * 0.42;
    const bedH = chassisH * 0.55;
    const bedLinerMat = trimMat;
    const bedMesh = new THREE.Mesh(createRoundedBoxGeometry(bedW, bedH, bedD, 0.04), bedLinerMat);
    bedMesh.position.set(0, chassisH + bedH / 2 + groundClearance - 0.04, -d * 0.26);
    bedMesh.userData = { partId: 'trim' };
    group.add(bedMesh);

  } else {
    // Sedan, SUV, Sports, EV Cabins
    const cabinW = w * (isSports ? 0.84 : 0.88);
    const cabinD = d * (isSUV ? 0.65 : (isSports ? 0.45 : 0.52));
    const cabinH = h * (isSports ? 0.38 : (isSUV ? 0.48 : 0.42));
    const cabinZ = isSUV ? -d * 0.02 : (isSports ? -d * 0.08 : -d * 0.05);

    const cabinGeom = createRoundedBoxGeometry(cabinW, cabinH, cabinD, isSports ? 0.12 : 0.08);
    const cabin = new THREE.Mesh(cabinGeom, glassMat);
    cabin.position.set(0, chassisH + cabinH / 2 + groundClearance - 0.03, cabinZ);
    cabin.castShadow = true;
    cabin.userData = { partId: 'glass' };
    group.add(cabin);

    // Roof (Panoramic glass roof for EV, metal for others)
    const roofMat = isEV ? glassMat : bodyMat;
    const roofGeom = createRoundedBoxGeometry(cabinW * 0.95, 0.04, cabinD * 0.78, 0.04);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(0, chassisH + cabinH + groundClearance - 0.02, cabinZ);
    roof.userData = { partId: isEV ? 'glass' : 'body' };
    group.add(roof);

    // SUV Roof Rack Rails
    if (isSUV) {
      [-cabinW * 0.42, cabinW * 0.42].forEach((rx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, cabinD * 0.75), trimMat);
        rail.position.set(rx, chassisH + cabinH + groundClearance + 0.025, cabinZ);
        rail.userData = { partId: 'trim' };
        group.add(rail);
      });
    }

    // Sports Car Rear Aerowing Spoiler
    if (isSports) {
      const wingW = w * 0.88;
      const wingH = 0.03;
      const wingD = 0.28;
      const wing = new THREE.Mesh(createRoundedBoxGeometry(wingW, wingH, wingD, 0.01), bodyMat);
      wing.position.set(0, chassisH + 0.22 + groundClearance, -d * 0.44);
      wing.userData = { partId: 'body' };
      group.add(wing);

      // 2 Wing Stanchion Mounts
      [-wingW * 0.35, wingW * 0.35].forEach((sx) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.12), trimMat);
        strut.position.set(sx, chassisH + 0.14 + groundClearance, -d * 0.44);
        strut.userData = { partId: 'trim' };
        group.add(strut);
      });
    }
  }

  // 3. 4 Alloy Wheels & Tires
  const tireGeom = new THREE.CylinderGeometry(wheelR, wheelR, wheelThick, 24);
  tireGeom.rotateZ(Math.PI / 2);
  const rimGeom = new THREE.CylinderGeometry(wheelR * (isSports ? 0.72 : 0.65), wheelR * (isSports ? 0.72 : 0.65), wheelThick + 0.012, 16);
  rimGeom.rotateZ(Math.PI / 2);

  const wheelOffsets = [
    [-w / 2 + 0.02, wheelR, -d * 0.29],
    [w / 2 - 0.02, wheelR, -d * 0.29],
    [-w / 2 + 0.02, wheelR, d * 0.29],
    [w / 2 - 0.02, wheelR, d * 0.29],
  ];

  wheelOffsets.forEach(([wx, wy, wz]) => {
    const tire = new THREE.Mesh(tireGeom, tireMat);
    tire.position.set(wx, wy, wz);
    tire.castShadow = true;
    group.add(tire);

    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.position.set(wx, wy, wz);
    rim.userData = { partId: 'rims' };
    group.add(rim);
  });

  // 4. Front Fascia / Grille & Headlights
  if (isEV) {
    // Sleek continuous horizontal LED cyber lightbar
    const barGeom = new THREE.BoxGeometry(w * 0.85, 0.04, 0.03);
    const bar = new THREE.Mesh(barGeom, lightHeadMat);
    bar.position.set(0, chassisH * 0.72 + groundClearance, d / 2 + 0.01);
    group.add(bar);
  } else {
    // Twin Projector Headlights
    [-w * 0.34, w * 0.34].forEach((lx) => {
      const headGeom = new THREE.BoxGeometry(0.24, 0.09, 0.04);
      const head = new THREE.Mesh(headGeom, lightHeadMat);
      head.position.set(lx, chassisH * 0.75 + groundClearance, d / 2 + 0.01);
      group.add(head);
    });

    // Front Radiator Grille
    const grille = new THREE.Mesh(createRoundedBoxGeometry(w * 0.45, 0.15, 0.03, 0.01), trimMat);
    grille.position.set(0, chassisH * 0.55 + groundClearance, d / 2 + 0.01);
    grille.userData = { partId: 'trim' };
    group.add(grille);
  }

  // 5. Rear Taillights
  if (isEV || isSports) {
    // Full-width continuous Ruby LED lightbar
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.04, 0.03), lightTailMat);
    tailBar.position.set(0, chassisH * 0.78 + groundClearance, -d / 2 - 0.01);
    group.add(tailBar);
  } else {
    [-w * 0.34, w * 0.34].forEach((lx) => {
      const tailGeom = new THREE.BoxGeometry(0.26, 0.09, 0.04);
      const tail = new THREE.Mesh(tailGeom, lightTailMat);
      tail.position.set(lx, chassisH * 0.78 + groundClearance, -d / 2 - 0.01);
      group.add(tail);
    });
  }

  // Dual Exhaust Outlets for Sports & SUV
  if (isSports || isSUV) {
    [-w * 0.28, w * 0.28].forEach((ex) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), rimMat);
      pipe.rotateX(Math.PI / 2);
      pipe.position.set(ex, groundClearance + 0.08, -d / 2 - 0.02);
      pipe.userData = { partId: 'trim' };
      group.add(pipe);
    });
  }

  return group;
}

export function buildProceduralMeshGroup(
  archetype: string,
  params: any,
  widthCm: number,
  depthCm: number,
  heightCm: number,
  material: THREE.Material,
  partMats?: Record<string, THREE.Material>
): THREE.Group {
  const merged = { ...params, width: widthCm, depth: depthCm, height: heightCm };
  if (archetype === 'table') return buildTableMeshGroup(merged, material, partMats);
  if (archetype === 'chair') return buildChairMeshGroup(merged, material, partMats);
  if (archetype === 'sofa') return buildSofaMeshGroup(merged, material, partMats);
  if (archetype === 'cabinet') return buildCabinetMeshGroup(merged, material, partMats);
  if (archetype === 'bed') return buildBedMeshGroup(merged, material, partMats);
  if (archetype === 'lamp') return buildLampMeshGroup({ ...params, shadeWidth: widthCm, shadeHeight: depthCm, totalHeight: heightCm }, material, partMats);
  if (archetype === 'shelf') return buildShelfMeshGroup(merged, material);
  if (archetype === 'door') return buildDoorMeshGroup(merged, material, partMats);
  if (archetype === 'window') return buildWindowMeshGroup(merged, material);
  if (archetype === 'wallDesign') return buildWallDesignMeshGroup(merged, material);
  if (archetype === 'decor') return buildInteriorDecorMeshGroup(merged, material);
  if (archetype === 'plant' || archetype === 'tree' || archetype === 'garden' || archetype === 'botanical') {
    return buildGardenBotanicalMeshGroup(merged, material, partMats);
  }
  if (archetype === 'stairs' || archetype === 'staircase') return buildStairsMeshGroup(merged, material, partMats);
  if (archetype === 'vehicle' || archetype === 'car') return buildVehicleMeshGroup(merged, material, partMats);
  if (archetype === 'tvUnit' || archetype === 'tv') return buildTvUnitMeshGroup(widthCm, depthCm, heightCm, material, partMats);
  if (archetype === 'radiator' || archetype === 'heater') return buildRadiatorMeshGroup(widthCm, depthCm, heightCm);
  if (archetype === 'cooker' || archetype === 'stove') return buildCookerMeshGroup(widthCm, depthCm, heightCm);
  if (archetype === 'bath' || archetype === 'toilet' || archetype === 'sink') return buildSanitaryMeshGroup(archetype, widthCm, depthCm, heightCm);
  if (archetype === 'desk') return buildDeskMeshGroup(widthCm, depthCm, heightCm, material);
  if (archetype === 'appliance') return buildApplianceMeshGroup(params.type || 'washing_machine', widthCm, depthCm, heightCm);
  if (archetype === 'washing_machine' || archetype === 'dryer' || archetype === 'refrigerator' || archetype === 'microwave' || archetype === 'air_conditioner') {
    return buildApplianceMeshGroup(archetype, widthCm, depthCm, heightCm);
  }
  if (archetype === 'primitives' && params.primitives) return buildCustomPrimitivesMeshGroup(params.primitives, material);
  
  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(widthCm * CM, heightCm * CM, depthCm * CM);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (heightCm * CM) / 2;
  mesh.castShadow = true;
  grp.add(mesh);
  return grp;
}
