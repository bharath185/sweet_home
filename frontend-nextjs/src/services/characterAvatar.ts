import * as THREE from 'three';

export interface CharacterAvatar {
  root: THREE.Group;
  legs: {
    left: THREE.Group;
    right: THREE.Group;
  };
  arms: {
    left: THREE.Group;
    right: THREE.Group;
  };
  torso: THREE.Group;
  head: THREE.Group;
  backpack: THREE.Group;
  updateAnimation: (
    delta: number,
    isMoving: boolean,
    isSprinting: boolean,
    isCrouching: boolean,
    moveYaw: number,
    camYaw: number,
    camPitch: number
  ) => void;
}

/**
 * Builds a realistic stylized 3D PUBG-style Character Avatar for Third-Person Perspective (TPP).
 * Includes tactical vest/jacket, backpack, combat boots, cap/helmet, and smooth walking/sprinting stride kinematics.
 */
export function buildPubgAvatar(): CharacterAvatar {
  const root = new THREE.Group();
  root.name = 'pubg_character_avatar';

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0ac87,
    roughness: 0.65,
    metalness: 0.05,
  });

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x242e38, // Tactical Navy Charcoal
    roughness: 0.75,
    metalness: 0.15,
  });

  const vestMat = new THREE.MeshStandardMaterial({
    color: 0x182026, // Ballistic Vest Dark Steel
    roughness: 0.85,
    metalness: 0.2,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x3b4252, // Cargo Pants Dark Slate
    roughness: 0.8,
    metalness: 0.05,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x141414, // Combat Boot Leather
    roughness: 0.6,
    metalness: 0.25,
  });

  const gearMat = new THREE.MeshStandardMaterial({
    color: 0x4c566a, // Backpack & Tactical Straps
    roughness: 0.85,
    metalness: 0.1,
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: 0x2e3440, // Tactical Ballcap / Helmet
    roughness: 0.7,
    metalness: 0.1,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Polarized Sunglasses / Visor
    roughness: 0.15,
    metalness: 0.9,
  });

  // Hips Root
  const hips = new THREE.Group();
  hips.position.y = 0.92;
  root.add(hips);

  // Pelvis / Belt
  const pelvisGeom = new THREE.BoxGeometry(0.32, 0.16, 0.22);
  const pelvis = new THREE.Mesh(pelvisGeom, pantsMat);
  pelvis.castShadow = true;
  hips.add(pelvis);

  // Belt & Utility Pouch
  const beltGeom = new THREE.BoxGeometry(0.34, 0.05, 0.24);
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
  const belt = new THREE.Mesh(beltGeom, beltMat);
  belt.position.y = 0.06;
  hips.add(belt);

  const pouchGeom = new THREE.BoxGeometry(0.08, 0.09, 0.06);
  const pouch = new THREE.Mesh(pouchGeom, gearMat);
  pouch.position.set(0.18, 0.04, 0.02);
  hips.add(pouch);

  // ----------------------------------------------------
  // LEGS (Left and Right Hip Hinges)
  // ----------------------------------------------------
  const buildLeg = (isLeft: boolean) => {
    const hipHinge = new THREE.Group();
    hipHinge.position.set(isLeft ? -0.1 : 0.1, -0.05, 0);

    // Thigh
    const thighGeom = new THREE.BoxGeometry(0.13, 0.38, 0.14);
    const thigh = new THREE.Mesh(thighGeom, pantsMat);
    thigh.position.y = -0.19;
    thigh.castShadow = true;
    hipHinge.add(thigh);

    // Thigh Cargo Pocket
    const cargoPocketGeom = new THREE.BoxGeometry(0.04, 0.12, 0.1);
    const cargoPocket = new THREE.Mesh(cargoPocketGeom, pantsMat);
    cargoPocket.position.set(isLeft ? -0.07 : 0.07, -0.18, 0);
    hipHinge.add(cargoPocket);

    // Knee / Calf Hinge
    const kneeHinge = new THREE.Group();
    kneeHinge.position.set(0, -0.38, 0);
    hipHinge.add(kneeHinge);

    const calfGeom = new THREE.BoxGeometry(0.12, 0.38, 0.13);
    const calf = new THREE.Mesh(calfGeom, pantsMat);
    calf.position.y = -0.19;
    calf.castShadow = true;
    kneeHinge.add(calf);

    // Boot
    const bootGeom = new THREE.BoxGeometry(0.13, 0.14, 0.22);
    const boot = new THREE.Mesh(bootGeom, bootMat);
    boot.position.set(0, -0.38, 0.04);
    boot.castShadow = true;
    kneeHinge.add(boot);

    return hipHinge;
  };

  const leftLeg = buildLeg(true);
  const rightLeg = buildLeg(false);
  hips.add(leftLeg);
  hips.add(rightLeg);

  // ----------------------------------------------------
  // TORSO & CHEST
  // ----------------------------------------------------
  const spine = new THREE.Group();
  spine.position.y = 0.08;
  hips.add(spine);

  // Abdomen
  const abdomenGeom = new THREE.BoxGeometry(0.32, 0.22, 0.22);
  const abdomen = new THREE.Mesh(abdomenGeom, jacketMat);
  abdomen.position.y = 0.11;
  abdomen.castShadow = true;
  spine.add(abdomen);

  // Upper Chest / Vest
  const chestGeom = new THREE.BoxGeometry(0.38, 0.28, 0.25);
  const chest = new THREE.Mesh(chestGeom, vestMat);
  chest.position.y = 0.34;
  chest.castShadow = true;
  spine.add(chest);

  // Tactical Vest Plate Front & Collar
  const vestPlateGeom = new THREE.BoxGeometry(0.32, 0.24, 0.04);
  const vestPlate = new THREE.Mesh(vestPlateGeom, vestMat);
  vestPlate.position.set(0, 0.34, 0.13);
  spine.add(vestPlate);

  // Tactical Backpack (Iconic PUBG Rucksack)
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 0.32, -0.18);

  const packMainGeom = new THREE.BoxGeometry(0.28, 0.34, 0.16);
  const packMain = new THREE.Mesh(packMainGeom, gearMat);
  packMain.castShadow = true;
  backpackGroup.add(packMain);

  const packBedrollGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.32, 12);
  const packBedroll = new THREE.Mesh(packBedrollGeom, jacketMat);
  packBedroll.rotation.z = Math.PI / 2;
  packBedroll.position.y = 0.2;
  backpackGroup.add(packBedroll);

  spine.add(backpackGroup);

  // ----------------------------------------------------
  // HEAD & HELMET / CAP
  // ----------------------------------------------------
  const neckHinge = new THREE.Group();
  neckHinge.position.set(0, 0.5, 0);
  spine.add(neckHinge);

  const neckGeom = new THREE.CylinderGeometry(0.06, 0.07, 0.09, 10);
  const neck = new THREE.Mesh(neckGeom, skinMat);
  neck.position.y = 0.04;
  neckHinge.add(neck);

  const headMeshGroup = new THREE.Group();
  headMeshGroup.position.y = 0.15;
  neckHinge.add(headMeshGroup);

  const headGeom = new THREE.BoxGeometry(0.18, 0.19, 0.19);
  const head = new THREE.Mesh(headGeom, skinMat);
  head.castShadow = true;
  headMeshGroup.add(head);

  // Sunglasses / Visor
  const visorGeom = new THREE.BoxGeometry(0.19, 0.05, 0.06);
  const visor = new THREE.Mesh(visorGeom, visorMat);
  visor.position.set(0, 0.02, 0.08);
  headMeshGroup.add(visor);

  // Tactical Cap with Forward Brim
  const capCrownGeom = new THREE.BoxGeometry(0.19, 0.08, 0.2);
  const capCrown = new THREE.Mesh(capCrownGeom, capMat);
  capCrown.position.y = 0.08;
  headMeshGroup.add(capCrown);

  const capBrimGeom = new THREE.BoxGeometry(0.18, 0.02, 0.1);
  const capBrim = new THREE.Mesh(capBrimGeom, capMat);
  capBrim.position.set(0, 0.05, 0.14);
  capBrim.rotation.x = -0.15;
  headMeshGroup.add(capBrim);

  // ----------------------------------------------------
  // ARMS (Left & Right Shoulder Hinges)
  // ----------------------------------------------------
  const buildArm = (isLeft: boolean) => {
    const shoulderHinge = new THREE.Group();
    shoulderHinge.position.set(isLeft ? -0.23 : 0.23, 0.44, 0);

    // Upper Arm
    const upperArmGeom = new THREE.BoxGeometry(0.1, 0.26, 0.1);
    const upperArm = new THREE.Mesh(upperArmGeom, jacketMat);
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shoulderHinge.add(upperArm);

    // Elbow Hinge
    const elbowHinge = new THREE.Group();
    elbowHinge.position.set(0, -0.26, 0);
    shoulderHinge.add(elbowHinge);

    // Forearm
    const forearmGeom = new THREE.BoxGeometry(0.09, 0.24, 0.09);
    const forearm = new THREE.Mesh(forearmGeom, jacketMat);
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbowHinge.add(forearm);

    // Tactical Glove
    const gloveGeom = new THREE.BoxGeometry(0.09, 0.11, 0.08);
    const glove = new THREE.Mesh(gloveGeom, gearMat);
    glove.position.set(0, -0.27, 0.01);
    elbowHinge.add(glove);

    return shoulderHinge;
  };

  const leftArm = buildArm(true);
  const rightArm = buildArm(false);
  spine.add(leftArm);
  spine.add(rightArm);

  // Animation State
  let walkPhase = 0;

  const updateAnimation = (
    delta: number,
    isMoving: boolean,
    isSprinting: boolean,
    isCrouching: boolean,
    moveYaw: number,
    camYaw: number,
    camPitch: number
  ) => {
    // Smooth root yaw orientation facing camera direction or movement
    const targetRootYaw = isMoving ? moveYaw : camYaw;
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, targetRootYaw, Math.min(1.0, delta * 14.0));

    // Head pitch tracks camera look angle
    headMeshGroup.rotation.x = THREE.MathUtils.clamp(camPitch * 0.7, -Math.PI / 4, Math.PI / 4);

    if (isMoving) {
      const frequency = isSprinting ? 14.0 : 8.5;
      walkPhase += delta * frequency;

      const maxLegAngle = isSprinting ? 0.65 : 0.42;
      const maxArmAngle = isSprinting ? 0.55 : 0.35;
      const stride = Math.sin(walkPhase);

      // Opposite arm and leg swings
      leftLeg.rotation.x = stride * maxLegAngle;
      rightLeg.rotation.x = -stride * maxLegAngle;

      leftArm.rotation.x = -stride * maxArmAngle;
      rightArm.rotation.x = stride * maxArmAngle;

      // Vertical kinematic body bob
      const bounce = Math.abs(Math.sin(walkPhase)) * (isSprinting ? 0.04 : 0.02);
      hips.position.y = (isCrouching ? 0.6 : 0.92) + bounce;

      // Torso lean into sprint
      spine.rotation.x = isSprinting ? 0.16 : 0.05;
      spine.rotation.z = Math.cos(walkPhase) * 0.03;
    } else {
      // Idle breathing stance
      walkPhase += delta * 2.2;
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, delta * 8);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, delta * 8);

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.06, delta * 8);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.06, delta * 8);

      const breathing = Math.sin(walkPhase) * 0.01;
      hips.position.y = (isCrouching ? 0.6 : 0.92) + breathing;
      spine.rotation.x = isCrouching ? 0.28 : 0;
      spine.rotation.z = 0;
    }

    if (isCrouching) {
      leftLeg.rotation.z = -0.08;
      rightLeg.rotation.z = 0.08;
      hips.position.y = 0.62;
    } else {
      leftLeg.rotation.z = 0;
      rightLeg.rotation.z = 0;
    }
  };

  return {
    root,
    legs: { left: leftLeg, right: rightLeg },
    arms: { left: leftArm, right: rightArm },
    torso: spine,
    head: headMeshGroup,
    backpack: backpackGroup,
    updateAnimation,
  };
}
