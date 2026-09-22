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
  if (params.shape === 'round') {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 36);
    topMesh = new THREE.Mesh(geom, topMat);
  } else if (params.shape === 'hexagonal') {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 6);
    topMesh = new THREE.Mesh(geom, topMat);
  } else {
    const geom = new THREE.BoxGeometry(w, topThick, d);
    topMesh = new THREE.Mesh(geom, topMat);
  }
  topMesh.position.y = h - topThick / 2;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  topMesh.userData = { partId: 'top' };
  group.add(topMesh);

  const legHeight = h - topThick;

  if (params.legStyle === 'pedestal_column' || params.shape === 'round') {
    const colGeom = new THREE.CylinderGeometry(legThick * 1.5, legThick * 2, legHeight, 24);
    const colMesh = new THREE.Mesh(colGeom, legsMat);
    colMesh.position.y = legHeight / 2;
    colMesh.castShadow = true;
    colMesh.userData = { partId: 'legs' };
    group.add(colMesh);

    const baseRadius = Math.min(w, d) * 0.35;
    const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.03, 32);
    const baseMesh = new THREE.Mesh(baseGeom, legsMat);
    baseMesh.position.y = 0.015;
    baseMesh.castShadow = true;
    baseMesh.userData = { partId: 'legs' };
    group.add(baseMesh);
  } else if (params.legStyle === 'trestle_base' || params.legStyle === 'cross_x_legs') {
    const leftX = -w / 2 + 0.15;
    const rightX = w / 2 - 0.15;

    [leftX, rightX].forEach((posX) => {
      const trestleGeom = new THREE.BoxGeometry(legThick, legHeight, d * 0.75);
      const tMesh = new THREE.Mesh(trestleGeom, legsMat);
      tMesh.position.set(posX, legHeight / 2, 0);
      tMesh.castShadow = true;
      tMesh.userData = { partId: 'legs' };
      group.add(tMesh);
    });

    const beamGeom = new THREE.BoxGeometry(w - 0.3, legThick * 0.8, legThick * 0.8);
    const beamMesh = new THREE.Mesh(beamGeom, legsMat);
    beamMesh.position.set(0, legHeight * 0.3, 0);
    beamMesh.castShadow = true;
    beamMesh.userData = { partId: 'legs' };
    group.add(beamMesh);
  } else {
    const offsetX = w / 2 - legThick;
    const offsetZ = d / 2 - legThick;
    const legGeom = new THREE.BoxGeometry(legThick, legHeight, legThick);

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
  const seatThick = 0.05;

  const seatGeom = new THREE.BoxGeometry(w, seatThick, d);
  const seatMesh = new THREE.Mesh(seatGeom, seatMat);
  seatMesh.position.set(0, seatH - seatThick / 2, 0);
  seatMesh.castShadow = true;
  seatMesh.userData = { partId: 'seat' };
  group.add(seatMesh);

  if (params.backrestStyle !== 'backless') {
    const backHeight = h - seatH;
    const backThick = 0.04;
    const backGeom = new THREE.BoxGeometry(w * 0.95, backHeight, backThick);
    const backMesh = new THREE.Mesh(backGeom, backMat);
    backMesh.position.set(0, seatH + backHeight / 2, -d / 2 + backThick / 2);
    backMesh.castShadow = true;
    backMesh.userData = { partId: 'backrest' };
    group.add(backMesh);
  }

  const legHeight = seatH - seatThick;
  const legThick = 0.04;
  const offsetX = w / 2 - legThick;
  const offsetZ = d / 2 - legThick;

  const positions = [
    [-offsetX, legHeight / 2, -offsetZ],
    [offsetX, legHeight / 2, -offsetZ],
    [-offsetX, legHeight / 2, offsetZ],
    [offsetX, legHeight / 2, offsetZ],
  ];

  const legGeom = new THREE.CylinderGeometry(legThick * 0.6, legThick, legHeight, 16);
  positions.forEach(([x, y, z]) => {
    const legMesh = new THREE.Mesh(legGeom, legsMat);
    legMesh.position.set(x, y, z);
    legMesh.castShadow = true;
    legMesh.userData = { partId: 'legs' };
    group.add(legMesh);
  });

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
  const armWidth = 0.15;

  const baseGeom = new THREE.BoxGeometry(w, 0.12, d);
  const baseMesh = new THREE.Mesh(baseGeom, legsMat);
  baseMesh.position.set(0, 0.06, 0);
  baseMesh.castShadow = true;
  baseMesh.userData = { partId: 'legs' };
  group.add(baseMesh);

  const seatW = w - armWidth * 2;
  const seatGeom = new THREE.BoxGeometry(seatW, 0.22, d * 0.85);
  const seatMesh = new THREE.Mesh(seatGeom, cushionsMat);
  seatMesh.position.set(0, 0.22, 0.02);
  seatMesh.castShadow = true;
  seatMesh.userData = { partId: 'cushions' };
  group.add(seatMesh);

  const backGeom = new THREE.BoxGeometry(w, h - 0.12, 0.2);
  const backMesh = new THREE.Mesh(backGeom, bodyMat);
  backMesh.position.set(0, h / 2 + 0.06, -d / 2 + 0.1);
  backMesh.castShadow = true;
  backMesh.userData = { partId: 'body' };
  group.add(backMesh);

  if (params.armStyle !== 'armless') {
    const armH = h * 0.72;
    [-w / 2 + armWidth / 2, w / 2 - armWidth / 2].forEach((xPos) => {
      const armGeom = new THREE.BoxGeometry(armWidth, armH, d);
      const armMesh = new THREE.Mesh(armGeom, bodyMat);
      armMesh.position.set(xPos, armH / 2 + 0.06, 0);
      armMesh.castShadow = true;
      armMesh.userData = { partId: 'body' };
      group.add(armMesh);
    });
  }

  // Accent throw pillows on corners
  const pilGeom = new THREE.BoxGeometry(0.22, 0.22, 0.08);
  [-seatW / 2 + 0.12, seatW / 2 - 0.12].forEach((px, idx) => {
    const pillow = new THREE.Mesh(pilGeom, pillowsMat);
    pillow.position.set(px, 0.32, -d / 2 + 0.26);
    pillow.rotation.y = idx === 0 ? 0.25 : -0.25;
    pillow.castShadow = true;
    pillow.userData = { partId: 'pillows' };
    group.add(pillow);
  });

  if (params.type === 'l_shape_left' || params.type === 'l_shape_right') {
    const chaiseX = params.type === 'l_shape_left' ? -w / 2 + d * 0.4 : w / 2 - d * 0.4;
    const chaiseGeom = new THREE.BoxGeometry(d * 0.7, 0.22, d * 0.9);
    const chaiseMesh = new THREE.Mesh(chaiseGeom, cushionsMat);
    chaiseMesh.position.set(chaiseX, 0.22, d * 0.7);
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
  const handlesMat = partMats?.handles || new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.2 });

  const w = Math.max(30, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(30, params.height) * CM;
  const wallThick = 0.025;

  const topGeom = new THREE.BoxGeometry(w, wallThick, d);
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

  // Door Faces & Handles
  const doorWidth = (w - wallThick * 2) / 2;
  [-doorWidth / 2, doorWidth / 2].forEach((dx, didx) => {
    const doorGeom = new THREE.BoxGeometry(doorWidth * 0.96, sideH * 0.96, 0.018);
    const doorMesh = new THREE.Mesh(doorGeom, doorsMat);
    doorMesh.position.set(dx, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), d / 2 - 0.01);
    doorMesh.castShadow = true;
    doorMesh.userData = { partId: 'doors' };
    group.add(doorMesh);

    // Handle Pull
    const handleGeom = new THREE.CylinderGeometry(0.006, 0.006, 0.12, 12);
    const handleMesh = new THREE.Mesh(handleGeom, handlesMat);
    const hx = didx === 0 ? dx + doorWidth * 0.35 : dx - doorWidth * 0.35;
    handleMesh.position.set(hx, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), d / 2 + 0.015);
    handleMesh.castShadow = true;
    handleMesh.userData = { partId: 'handles' };
    group.add(handleMesh);
  });

  if (params.hasLegs) {
    const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16);
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

  const frameGeom = new THREE.BoxGeometry(w + 0.1, frameH, d + 0.1);
  const frameMesh = new THREE.Mesh(frameGeom, frameMat);
  frameMesh.position.set(0, frameH / 2, 0);
  frameMesh.castShadow = true;
  frameMesh.userData = { partId: 'frame' };
  group.add(frameMesh);

  const matGeom = new THREE.BoxGeometry(w, 0.22, d);
  const matMesh = new THREE.Mesh(matGeom, beddingMat);
  matMesh.position.set(0, frameH + 0.11, 0);
  matMesh.castShadow = true;
  matMesh.userData = { partId: 'bedding' };
  group.add(matMesh);

  const pillowGeom = new THREE.BoxGeometry(w * 0.4, 0.1, 0.35);
  [-w * 0.22, w * 0.22].forEach((xPos) => {
    const pillow = new THREE.Mesh(pillowGeom, pillowMat);
    pillow.position.set(xPos, frameH + 0.26, -d / 2 + 0.25);
    pillow.castShadow = true;
    pillow.userData = { partId: 'pillows' };
    group.add(pillow);
  });

  if (params.headboardStyle !== 'none') {
    const headH = Math.max(0.6, h);
    const headGeom = new THREE.BoxGeometry(w + 0.15, headH, 0.1);
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
    const shadeMesh = new THREE.Mesh(shadeGeom, mat);
    shadeMesh.position.set(0, totalH - shadeH / 2, 0);
    shadeMesh.castShadow = true;
    group.add(shadeMesh);

    const poleGeom = new THREE.CylinderGeometry(0.015, 0.015, totalH - shadeH, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const poleMesh = new THREE.Mesh(poleGeom, poleMat);
    poleMesh.position.set(0, (totalH - shadeH) / 2, 0);
    group.add(poleMesh);

    const baseGeom = new THREE.CylinderGeometry(shadeR * 0.8, shadeR * 0.8, 0.02, 24);
    const baseMesh = new THREE.Mesh(baseGeom, poleMat);
    baseMesh.position.set(0, 0.01, 0);
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
  type?: 'straight' | 'spiral' | 'l_shape';
  width: number;
  depth: number;
  height: number;
  stepsCount?: number;
  hasHandrail?: boolean;
}

export function buildStairsMeshGroup(params: StairsParams, mat: THREE.Material, partMats?: Record<string, THREE.Material>): THREE.Group {
  const group = new THREE.Group();
  const treadsMat = partMats?.treads || mat;
  const stringersMat = partMats?.stringers || new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
  const handrailMat = partMats?.handrail || stringersMat;

  const w = Math.max(60, params.width) * CM;
  const d = Math.max(100, params.depth) * CM;
  const h = Math.max(150, params.height) * CM;
  const steps = params.stepsCount || 14;
  const hasHandrail = params.hasHandrail !== false;

  const stepRise = h / steps;
  const stepRun = d / steps;

  if (params.type === 'spiral') {
    // Elegant Spiral / Helical Staircase with center column & radiating treads
    const centerRadius = 0.08;
    const colGeom = new THREE.CylinderGeometry(centerRadius, centerRadius, h, 24);
    const colMesh = new THREE.Mesh(colGeom, stringersMat);
    colMesh.position.y = h / 2;
    colMesh.castShadow = true;
    colMesh.userData = { partId: 'stringers' };
    group.add(colMesh);

    const outerRadius = Math.min(w, d) / 2;
    const angleStep = (Math.PI * 1.6) / steps;

    for (let i = 0; i < steps; i++) {
      const stepAngle = i * angleStep;
      const stepY = i * stepRise + stepRise / 2;

      // Wedge shaped tread
      const treadGeom = new THREE.BoxGeometry(outerRadius, 0.035, 0.22);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(Math.cos(stepAngle) * (outerRadius / 2), stepY, Math.sin(stepAngle) * (outerRadius / 2));
      treadMesh.rotation.y = -stepAngle;
      treadMesh.castShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);

      // Baluster spindle
      if (hasHandrail) {
        const balGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.85, 8);
        const balMesh = new THREE.Mesh(balGeom, handrailMat);
        balMesh.position.set(Math.cos(stepAngle) * (outerRadius - 0.03), stepY + 0.425, Math.sin(stepAngle) * (outerRadius - 0.03));
        balMesh.userData = { partId: 'handrail' };
        group.add(balMesh);
      }
    }
  } else {
    // Classic Architectural Straight / Open-Riser Flight
    const stringerThick = 0.05;

    // Left and right stringer beams
    const beamLen = Math.hypot(d, h);
    const beamAngle = Math.atan2(h, d);
    const beamGeom = new THREE.BoxGeometry(stringerThick, 0.16, beamLen);

    const leftBeam = new THREE.Mesh(beamGeom, stringersMat);
    leftBeam.position.set(-w / 2 + stringerThick / 2, h / 2, 0);
    leftBeam.rotation.x = beamAngle;
    leftBeam.userData = { partId: 'stringers' };
    group.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamGeom, stringersMat);
    rightBeam.position.set(w / 2 - stringerThick / 2, h / 2, 0);
    rightBeam.rotation.x = beamAngle;
    rightBeam.userData = { partId: 'stringers' };
    group.add(rightBeam);

    // Horizontal Steps / Treads
    for (let i = 0; i < steps; i++) {
      const zPos = -d / 2 + i * stepRun + stepRun / 2;
      const yPos = (i + 1) * stepRise;

      const treadGeom = new THREE.BoxGeometry(w - stringerThick * 2, 0.04, stepRun * 1.1);
      const treadMesh = new THREE.Mesh(treadGeom, treadsMat);
      treadMesh.position.set(0, yPos - 0.02, zPos);
      treadMesh.castShadow = true;
      treadMesh.receiveShadow = true;
      treadMesh.userData = { partId: 'treads' };
      group.add(treadMesh);
    }

    // Safety Handrail & Balusters along left edge
    if (hasHandrail) {
      const railH = 0.85;
      const handrailGeom = new THREE.CylinderGeometry(0.02, 0.02, beamLen, 12);
      const handrailMesh = new THREE.Mesh(handrailGeom, handrailMat);
      handrailMesh.position.set(w / 2, h / 2 + railH, 0);
      handrailMesh.rotation.x = beamAngle;
      handrailMesh.userData = { partId: 'handrail' };
      group.add(handrailMesh);

      // Support Posts
      for (let p = 0; p <= 3; p++) {
        const frac = p / 3;
        const pz = -d / 2 + frac * d;
        const py = frac * h;
        const postGeom = new THREE.CylinderGeometry(0.015, 0.015, railH, 8);
        const postMesh = new THREE.Mesh(postGeom, handrailMat);
        postMesh.position.set(w / 2, py + railH / 2, pz);
        postMesh.userData = { partId: 'handrail' };
        group.add(postMesh);
      }
    }
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
  if (archetype === 'stairs' || archetype === 'staircase') return buildStairsMeshGroup(merged, material, partMats);
  if (archetype === 'primitives' && params.primitives) return buildCustomPrimitivesMeshGroup(params.primitives, material);
  
  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(widthCm * CM, heightCm * CM, depthCm * CM);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (heightCm * CM) / 2;
  mesh.castShadow = true;
  grp.add(mesh);
  return grp;
}
