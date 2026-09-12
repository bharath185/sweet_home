import * as THREE from 'three';

// Procedural high-resolution PBR procedural textures
function createWoodParquetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base wood color
  ctx.fillStyle = '#b58351';
  ctx.fillRect(0, 0, 1024, 1024);

  // Parquet planks
  const plankW = 128;
  const plankH = 512;

  for (let x = 0; x < 1024; x += plankW) {
    for (let y = 0; y < 1024; y += plankH) {
      const shade = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgb(${181 + shade}, ${131 + shade}, ${81 + shade})`;
      ctx.fillRect(x + 2, y + 2, plankW - 4, plankH - 4);

      // Wood grain lines
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let g = 0; g < 15; g++) {
        const gy = y + Math.random() * plankH;
        ctx.fillRect(x + 2, gy, plankW - 4, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createPlasterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise for realistic wall plaster
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export const RealisticMaterials = {
  getFloorMaterial: () => new THREE.MeshStandardMaterial({
    map: createWoodParquetTexture(),
    roughness: 0.35,
    metalness: 0.05
  }),

  getWallMaterial: () => new THREE.MeshStandardMaterial({
    map: createPlasterTexture(),
    roughness: 0.85,
    metalness: 0.0,
    color: '#ffffff'
  }),

  getGlassMaterial: () => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5
  }),

  getFurnitureMaterial: (baseColor = '#3b82f6', roughness = 0.5, metalness = 0.1) => new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: roughness,
    metalness: metalness
  })
};
