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

export function buildTableMeshGroup(params: TableParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(20, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(20, params.height) * CM;
  const topThick = Math.max(2, params.topThickness || 4) * CM;
  const legThick = Math.max(2, params.legThickness || 6) * CM;

  let topMesh: THREE.Mesh;
  if (params.shape === 'round') {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 36);
    topMesh = new THREE.Mesh(geom, mat);
  } else if (params.shape === 'hexagonal') {
    const radius = Math.min(w, d) / 2;
    const geom = new THREE.CylinderGeometry(radius, radius, topThick, 6);
    topMesh = new THREE.Mesh(geom, mat);
  } else {
    const geom = new THREE.BoxGeometry(w, topThick, d);
    topMesh = new THREE.Mesh(geom, mat);
  }
  topMesh.position.y = h - topThick / 2;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  const legHeight = h - topThick;

  if (params.legStyle === 'pedestal_column' || params.shape === 'round') {
    const colGeom = new THREE.CylinderGeometry(legThick * 1.5, legThick * 2, legHeight, 24);
    const colMesh = new THREE.Mesh(colGeom, mat);
    colMesh.position.y = legHeight / 2;
    colMesh.castShadow = true;
    group.add(colMesh);

    const baseRadius = Math.min(w, d) * 0.35;
    const baseGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.03, 32);
    const baseMesh = new THREE.Mesh(baseGeom, mat);
    baseMesh.position.y = 0.015;
    baseMesh.castShadow = true;
    group.add(baseMesh);
  } else if (params.legStyle === 'trestle_base' || params.legStyle === 'cross_x_legs') {
    const leftX = -w / 2 + 0.15;
    const rightX = w / 2 - 0.15;

    [leftX, rightX].forEach((posX) => {
      const trestleGeom = new THREE.BoxGeometry(legThick, legHeight, d * 0.75);
      const tMesh = new THREE.Mesh(trestleGeom, mat);
      tMesh.position.set(posX, legHeight / 2, 0);
      tMesh.castShadow = true;
      group.add(tMesh);
    });

    const beamGeom = new THREE.BoxGeometry(w - 0.3, legThick * 0.8, legThick * 0.8);
    const beamMesh = new THREE.Mesh(beamGeom, mat);
    beamMesh.position.set(0, legHeight * 0.3, 0);
    beamMesh.castShadow = true;
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
      const legMesh = new THREE.Mesh(legGeom, mat);
      legMesh.position.set(x, y, z);
      legMesh.castShadow = true;
      group.add(legMesh);
    });
  }

  return group;
}

export function buildChairMeshGroup(params: ChairParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(30, params.width) * CM;
  const d = Math.max(30, params.depth) * CM;
  const h = Math.max(40, params.height) * CM;
  const seatH = Math.max(25, params.seatHeight || 45) * CM;
  const seatThick = 0.05;

  const seatGeom = new THREE.BoxGeometry(w, seatThick, d);
  const seatMesh = new THREE.Mesh(seatGeom, mat);
  seatMesh.position.set(0, seatH - seatThick / 2, 0);
  seatMesh.castShadow = true;
  group.add(seatMesh);

  if (params.backrestStyle !== 'backless') {
    const backHeight = h - seatH;
    const backThick = 0.04;
    const backGeom = new THREE.BoxGeometry(w * 0.95, backHeight, backThick);
    const backMesh = new THREE.Mesh(backGeom, mat);
    backMesh.position.set(0, seatH + backHeight / 2, -d / 2 + backThick / 2);
    backMesh.castShadow = true;
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
    const legMesh = new THREE.Mesh(legGeom, mat);
    legMesh.position.set(x, y, z);
    legMesh.castShadow = true;
    group.add(legMesh);
  });

  return group;
}

export function buildSofaMeshGroup(params: SofaParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(60, params.width) * CM;
  const d = Math.max(60, params.depth) * CM;
  const h = Math.max(50, params.height) * CM;
  const armWidth = 0.15;

  const baseGeom = new THREE.BoxGeometry(w, 0.12, d);
  const baseMesh = new THREE.Mesh(baseGeom, mat);
  baseMesh.position.set(0, 0.06, 0);
  baseMesh.castShadow = true;
  group.add(baseMesh);

  const seatW = w - armWidth * 2;
  const seatGeom = new THREE.BoxGeometry(seatW, 0.22, d * 0.85);
  const seatMesh = new THREE.Mesh(seatGeom, mat);
  seatMesh.position.set(0, 0.22, 0.02);
  seatMesh.castShadow = true;
  group.add(seatMesh);

  const backGeom = new THREE.BoxGeometry(w, h - 0.12, 0.2);
  const backMesh = new THREE.Mesh(backGeom, mat);
  backMesh.position.set(0, h / 2 + 0.06, -d / 2 + 0.1);
  backMesh.castShadow = true;
  group.add(backMesh);

  if (params.armStyle !== 'armless') {
    const armH = h * 0.72;
    [-w / 2 + armWidth / 2, w / 2 - armWidth / 2].forEach((xPos) => {
      const armGeom = new THREE.BoxGeometry(armWidth, armH, d);
      const armMesh = new THREE.Mesh(armGeom, mat);
      armMesh.position.set(xPos, armH / 2 + 0.06, 0);
      armMesh.castShadow = true;
      group.add(armMesh);
    });
  }

  if (params.type === 'l_shape_left' || params.type === 'l_shape_right') {
    const chaiseX = params.type === 'l_shape_left' ? -w / 2 + d * 0.4 : w / 2 - d * 0.4;
    const chaiseGeom = new THREE.BoxGeometry(d * 0.7, 0.22, d * 0.9);
    const chaiseMesh = new THREE.Mesh(chaiseGeom, mat);
    chaiseMesh.position.set(chaiseX, 0.22, d * 0.7);
    chaiseMesh.castShadow = true;
    group.add(chaiseMesh);
  }

  return group;
}

export function buildCabinetMeshGroup(params: CabinetParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(30, params.width) * CM;
  const d = Math.max(20, params.depth) * CM;
  const h = Math.max(30, params.height) * CM;
  const wallThick = 0.025;

  const topGeom = new THREE.BoxGeometry(w, wallThick, d);
  const topMesh = new THREE.Mesh(topGeom, mat);
  topMesh.position.set(0, h - wallThick / 2, 0);
  topMesh.castShadow = true;
  group.add(topMesh);

  const bottomMesh = new THREE.Mesh(topGeom, mat);
  bottomMesh.position.set(0, wallThick / 2 + (params.hasLegs ? 0.1 : 0), 0);
  bottomMesh.castShadow = true;
  group.add(bottomMesh);

  const sideH = h - wallThick * 2 - (params.hasLegs ? 0.1 : 0);
  const sideGeom = new THREE.BoxGeometry(wallThick, sideH, d);

  const leftMesh = new THREE.Mesh(sideGeom, mat);
  leftMesh.position.set(-w / 2 + wallThick / 2, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), 0);
  leftMesh.castShadow = true;
  group.add(leftMesh);

  const rightMesh = new THREE.Mesh(sideGeom, mat);
  rightMesh.position.set(w / 2 - wallThick / 2, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), 0);
  rightMesh.castShadow = true;
  group.add(rightMesh);

  const backGeom = new THREE.BoxGeometry(w, sideH, 0.01);
  const backMesh = new THREE.Mesh(backGeom, mat);
  backMesh.position.set(0, sideH / 2 + wallThick + (params.hasLegs ? 0.1 : 0), -d / 2 + 0.005);
  backMesh.castShadow = true;
  group.add(backMesh);

  const rows = Math.max(1, params.rows || 2);
  for (let r = 1; r < rows; r++) {
    const shelfGeom = new THREE.BoxGeometry(w - wallThick * 2, wallThick, d - 0.02);
    const shelfMesh = new THREE.Mesh(shelfGeom, mat);
    shelfMesh.position.set(0, (sideH / rows) * r + (params.hasLegs ? 0.1 : 0), 0);
    shelfMesh.castShadow = true;
    group.add(shelfMesh);
  }

  if (params.hasLegs) {
    const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16);
    [
      [-w / 2 + 0.05, 0.05, -d / 2 + 0.05],
      [w / 2 - 0.05, 0.05, -d / 2 + 0.05],
      [-w / 2 + 0.05, 0.05, d / 2 - 0.05],
      [w / 2 - 0.05, 0.05, d / 2 - 0.05],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeom, mat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      group.add(leg);
    });
  }

  return group;
}

export function buildBedMeshGroup(params: BedParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const w = Math.max(80, params.width) * CM;
  const d = Math.max(120, params.depth) * CM;
  const h = Math.max(40, params.height) * CM;
  const frameH = 0.25;

  const frameGeom = new THREE.BoxGeometry(w + 0.1, frameH, d + 0.1);
  const frameMesh = new THREE.Mesh(frameGeom, mat);
  frameMesh.position.set(0, frameH / 2, 0);
  frameMesh.castShadow = true;
  group.add(frameMesh);

  const matGeom = new THREE.BoxGeometry(w, 0.22, d);
  const matMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, metalness: 0.05 });
  const matMesh = new THREE.Mesh(matGeom, matMat);
  matMesh.position.set(0, frameH + 0.11, 0);
  matMesh.castShadow = true;
  group.add(matMesh);

  const pillowGeom = new THREE.BoxGeometry(w * 0.4, 0.1, 0.35);
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  [-w * 0.22, w * 0.22].forEach((xPos) => {
    const pillow = new THREE.Mesh(pillowGeom, pillowMat);
    pillow.position.set(xPos, frameH + 0.26, -d / 2 + 0.25);
    pillow.castShadow = true;
    group.add(pillow);
  });

  if (params.headboardStyle !== 'none') {
    const headH = Math.max(0.6, h);
    const headGeom = new THREE.BoxGeometry(w + 0.15, headH, 0.1);
    const headMesh = new THREE.Mesh(headGeom, mat);
    headMesh.position.set(0, headH / 2, -d / 2 - 0.05);
    headMesh.castShadow = true;
    group.add(headMesh);
  }

  return group;
}

export function buildLampMeshGroup(params: LampParams, mat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
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
    const domeGeom = new THREE.SphereGeometry(shadeR, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.rotateX(Math.PI);
    const domeMesh = new THREE.Mesh(domeGeom, mat);
    domeMesh.position.set(0, totalH - 0.05, 0);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    const cordGeom = new THREE.CylinderGeometry(0.005, 0.005, totalH, 8);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
    const cordMesh = new THREE.Mesh(cordGeom, cordMat);
    cordMesh.position.set(0, totalH / 2, 0);
    group.add(cordMesh);
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


export function buildProceduralMeshGroup(
  archetype: string,
  params: any,
  widthCm: number,
  depthCm: number,
  heightCm: number,
  material: THREE.Material
): THREE.Group {
  const merged = { ...params, width: widthCm, depth: depthCm, height: heightCm };
  if (archetype === 'table') return buildTableMeshGroup(merged, material);
  if (archetype === 'chair') return buildChairMeshGroup(merged, material);
  if (archetype === 'sofa') return buildSofaMeshGroup(merged, material);
  if (archetype === 'cabinet') return buildCabinetMeshGroup(merged, material);
  if (archetype === 'bed') return buildBedMeshGroup(merged, material);
  if (archetype === 'lamp') return buildLampMeshGroup({ ...params, shadeWidth: widthCm, shadeHeight: depthCm, totalHeight: heightCm }, material);
  if (archetype === 'primitives' && params.primitives) return buildCustomPrimitivesMeshGroup(params.primitives, material);
  
  const grp = new THREE.Group();
  const geom = new THREE.BoxGeometry(widthCm * CM, heightCm * CM, depthCm * CM);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = (heightCm * CM) / 2;
  mesh.castShadow = true;
  grp.add(mesh);
  return grp;
}
