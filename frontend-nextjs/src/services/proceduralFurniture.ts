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
  doorType: 'open_shelf' | 'solid_doors' | 'glass_doors' | 'drawers';
  width: number;
  depth: number;
  height: number;
  hasLegs: boolean;
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
 * Creates a high-detail rounded box geometry with soft bevel edges (Sweet Home 3D Quality)
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
    // True smooth beveled elliptical tabletop (Sweet Home 3D oval dining table)
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

  // Sweet Home 3D Detail: Under-table Apron Frame
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

      // Sweet Home 3D Metallic Brass Feet Caps (Ferrules)
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

  // Sweet Home 3D Detail: Upholstered Seat Cushion with Beveled Edge
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

  // 5. Individual Plump Seat Cushions (Sweet Home 3D Multi-cushion design)
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
  const topMat = partMats?.top || mat;
  const frameMat = partMats?.frame || mat;
  const doorsMat = partMats?.doors || mat;
  const legsMat = partMats?.legs || mat;
  const handlesMat = partMats?.handles || brassCapMat;

  const w = Math.max(30, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(30, params.height) * CM;
  const wallThick = 0.025;

  const topGeom = createRoundedBoxGeometry(w, wallThick, d, 0.01);
  const topMesh = new THREE.Mesh(topGeom, topMat);
  topMesh.position.set(0, h - wallThick / 2, 0);
  topMesh.castShadow = true;
  topMesh.userData = { partId: 'top' };
  group.add(topMesh);

  const bottomMesh = new THREE.Mesh(topGeom, frameMat);
  bottomMesh.position.set(0, wallThick / 2 + (params.hasLegs ? 0.1 : 0), 0);
  bottomMesh.castShadow = true;
  bottomMesh.userData = { partId: 'frame' };
  group.add(bottomMesh);

  const sideH = h - wallThick * 2 - (params.hasLegs ? 0.1 : 0);
  const sideGeom = new THREE.BoxGeometry(wallThick, sideH, d);

  const leftMesh = new THREE.Mesh(sideGeom, frameMat);
  leftMesh.position.set(-w / 2 + wallThick / 2, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), 0);
  leftMesh.castShadow = true;
  leftMesh.userData = { partId: 'frame' };
  group.add(leftMesh);

  const rightMesh = new THREE.Mesh(sideGeom, frameMat);
  rightMesh.position.set(w / 2 - wallThick / 2, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), 0);
  rightMesh.castShadow = true;
  rightMesh.userData = { partId: 'frame' };
  group.add(rightMesh);

  const backGeom = new THREE.BoxGeometry(w, sideH, 0.01);
  const backMesh = new THREE.Mesh(backGeom, frameMat);
  backMesh.position.set(0, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), -d / 2 + 0.005);
  backMesh.castShadow = true;
  backMesh.userData = { partId: 'frame' };
  group.add(backMesh);

  // Door Faces & Handles with Recessed Frame Detailing
  const doorWidth = (w - wallThick * 2) / 2;
  [-doorWidth / 2, doorWidth / 2].forEach((dx, didx) => {
    const doorGeom = createRoundedBoxGeometry(doorWidth * 0.96, sideH * 0.96, 0.018, 0.008);
    const doorMesh = new THREE.Mesh(doorGeom, doorsMat);
    doorMesh.position.set(dx, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), d / 2 - 0.01);
    doorMesh.castShadow = true;
    doorMesh.userData = { partId: 'doors' };
    group.add(doorMesh);

    // Sweet Home 3D Detail: Chrome/Brass Handle Pull Bar
    const handleGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.14, 16);
    handleGeom.computeVertexNormals();
    const handleMesh = new THREE.Mesh(handleGeom, handlesMat);
    const hx = didx === 0 ? dx + doorWidth * 0.35 : dx - doorWidth * 0.35;
    handleMesh.position.set(hx, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), d / 2 + 0.015);
    handleMesh.castShadow = true;
    handleMesh.userData = { partId: 'handles' };
    group.add(handleMesh);
  });

  if (params.hasLegs) {
    const legGeom = new THREE.CylinderGeometry(0.02, 0.015, 0.1, 20);
    legGeom.computeVertexNormals();
    [
      [-w / 2 + 0.05, 0.05, -d / 2 + 0.05],
      [w / 2 - 0.05, 0.05, -d / 2 + 0.05],
      [-w / 2 + 0.05, 0.05, d / 2 - 0.05],
      [w / 2 - 0.05, 0.05, d / 2 - 0.05],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeom, legsMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      leg.userData = { partId: 'legs' };
      group.add(leg);

      const capGeom = new THREE.CylinderGeometry(0.016, 0.017, 0.02, 20);
      const capMesh = new THREE.Mesh(capGeom, brassCapMat);
      capMesh.position.set(x, 0.01, z);
      capMesh.userData = { partId: 'legs' };
      group.add(capMesh);
    });
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

  // Sweet Home 3D Detail: Layered Mattress with Quilted Edge
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
  const frameThick = 0.05;
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    transmission: 0.92,
    reflectivity: 0.6,
  });

  // Sill at bottom (Stationary)
  const sillGeom = new THREE.BoxGeometry(w * 1.08, 0.04, d * 1.3);
  const sill = new THREE.Mesh(sillGeom, mat);
  sill.position.set(0, 0.02, 0);
  group.add(sill);

  // Outer Window Frame
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(w, frameThick, d), mat);
  topFrame.position.set(0, h - frameThick / 2, 0);
  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h - 0.04, d), mat);
  leftFrame.position.set(-w / 2 + frameThick / 2, h / 2, 0);
  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(frameThick, h - 0.04, d), mat);
  rightFrame.position.set(w / 2 - frameThick / 2, h / 2, 0);
  group.add(topFrame, leftFrame, rightFrame);

  const glassW = w - frameThick * 2;
  const glassH = h - frameThick - 0.04;

  if (params.type === 'modern_sliding') {
    // Fixed Left Pane
    const fixedGlass = new THREE.Mesh(new THREE.BoxGeometry(glassW / 2, glassH, 0.012), glassMat);
    fixedGlass.position.set(-glassW / 4, h / 2, -0.01);
    group.add(fixedGlass);

    // Sliding Right Sash Pane (Slides Open to the Left on Proximity)
    const slidingSash = new THREE.Group();
    slidingSash.userData = {
      animType: 'slide_x',
      slideDist: -glassW * 0.42,
      currentProgress: 0,
      targetProgress: 0,
    };

    const movingGlass = new THREE.Mesh(new THREE.BoxGeometry(glassW / 2, glassH, 0.012), glassMat);
    movingGlass.position.set(glassW / 4, h / 2, 0.01);
    const sashDivider = new THREE.Mesh(new THREE.BoxGeometry(0.035, glassH, 0.025), mat);
    sashDivider.position.set(0, h / 2, 0.01);
    slidingSash.add(movingGlass, sashDivider);

    group.add(slidingSash);
    group.userData.animParts = [slidingSash];
  } else if (params.type === 'french_arch') {
    // Arched Top
    const archR = w / 2;
    const archGeom = new THREE.CylinderGeometry(archR, archR, d, 32, 1, false, 0, Math.PI);
    archGeom.rotateX(Math.PI / 2);
    archGeom.rotateZ(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeom, mat);
    archMesh.position.set(0, h, 0);
    group.add(archMesh);

    // Casement Pane that swings open
    const windowPivot = new THREE.Group();
    windowPivot.position.set(-glassW / 2, 0, 0);
    windowPivot.userData = {
      animType: 'hinge_single',
      openRotation: Math.PI * 0.35, // ~60 degrees casement opening
      currentProgress: 0,
      targetProgress: 0,
    };

    const glass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.015), glassMat);
    glass.position.set(glassW / 2, h / 2, 0);
    windowPivot.add(glass);

    group.add(windowPivot);
    group.userData.animParts = [windowPivot];
  } else {
    // Standard / Panoramic / Grid window with casement swing
    const windowPivot = new THREE.Group();
    windowPivot.position.set(-glassW / 2, 0, 0);
    windowPivot.userData = {
      animType: 'hinge_single',
      openRotation: Math.PI * 0.35,
      currentProgress: 0,
      targetProgress: 0,
    };

    const glass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.015), glassMat);
    glass.position.set(glassW / 2, h / 2, 0);
    windowPivot.add(glass);

    if (params.type === 'grid_double_hung') {
      const vertMullion = new THREE.Mesh(new THREE.BoxGeometry(0.02, glassH, 0.02), mat);
      vertMullion.position.set(glassW / 2, h / 2, 0);
      const horizMullion1 = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.02, 0.02), mat);
      horizMullion1.position.set(glassW / 2, h * 0.35, 0);
      const horizMullion2 = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.02, 0.02), mat);
      horizMullion2.position.set(glassW / 2, h * 0.65, 0);
      windowPivot.add(vertMullion, horizMullion1, horizMullion2);
    }

    group.add(windowPivot);
    group.userData.animParts = [windowPivot];
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
  if (archetype === 'stairs' || archetype === 'staircase') return buildStairsMeshGroup(merged, material, partMats);
  if (archetype === 'tvUnit' || archetype === 'tv') return buildTvUnitMeshGroup(widthCm, depthCm, heightCm, material, partMats);
  if (archetype === 'radiator' || archetype === 'heater') return buildRadiatorMeshGroup(widthCm, depthCm, heightCm);
  if (archetype === 'cooker' || archetype === 'stove') return buildCookerMeshGroup(widthCm, depthCm, heightCm);
  if (archetype === 'bath' || archetype === 'toilet' || archetype === 'sink') return buildSanitaryMeshGroup(archetype, widthCm, depthCm, heightCm);
  if (archetype === 'desk') return buildDeskMeshGroup(widthCm, depthCm, heightCm, material);
  if (archetype === 'primitives' && params.primitives) return buildCustomPrimitivesMeshGroup(params.primitives, material);
  
  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(widthCm * CM, heightCm * CM, depthCm * CM);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (heightCm * CM) / 2;
  mesh.castShadow = true;
  grp.add(mesh);
  return grp;
}
