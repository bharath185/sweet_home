import * as THREE from 'three';

// Cache generated canvas textures in memory to avoid rebuilding every frame
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-detail procedural PBR textures for architectural surfaces.
 */
export function getProceduralTexture(textureType: string, tintHex?: string): THREE.CanvasTexture {
  const cacheKey = `${textureType}_${tintHex || 'default'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  switch (textureType) {
    case 'hardwood_oak':
    case 'parquet_oak': {
      // Warm Natural Oak Wood Planks
      ctx.fillStyle = tintHex || '#d4a373';
      ctx.fillRect(0, 0, 1024, 1024);

      const plankHeight = 64;
      for (let y = 0; y < 1024; y += plankHeight) {
        // Plank horizontal groove
        ctx.fillStyle = 'rgba(60, 35, 20, 0.45)';
        ctx.fillRect(0, y, 1024, 2);

        // Staggered vertical seams
        const offsetX = (Math.floor(y / plankHeight) % 3) * 340;
        for (let x = offsetX; x < 1024; x += 340) {
          ctx.fillRect(x, y, 2, plankHeight);
        }

        // Wood grain streaks
        ctx.fillStyle = 'rgba(90, 50, 25, 0.08)';
        for (let g = 0; g < 6; g++) {
          const gy = y + 8 + g * 8;
          ctx.fillRect(0, gy, 1024, 1.5);
        }
      }
      break;
    }

    case 'hardwood_walnut': {
      // Deep Walnut Dark Flooring
      ctx.fillStyle = tintHex || '#4a332a';
      ctx.fillRect(0, 0, 1024, 1024);

      const plankHeight = 50;
      for (let y = 0; y < 1024; y += plankHeight) {
        ctx.fillStyle = 'rgba(20, 12, 8, 0.55)';
        ctx.fillRect(0, y, 1024, 2.5);

        const offsetX = (Math.floor(y / plankHeight) % 2) * 512;
        for (let x = offsetX; x < 1024; x += 512) {
          ctx.fillRect(x, y, 2, plankHeight);
        }

        ctx.fillStyle = 'rgba(255, 220, 180, 0.05)';
        for (let g = 0; g < 4; g++) {
          ctx.fillRect(0, y + 10 + g * 10, 1024, 1.2);
        }
      }
      break;
    }

    case 'herringbone': {
      // Classic Luxury Herringbone Parquet
      ctx.fillStyle = tintHex || '#c18c5d';
      ctx.fillRect(0, 0, 1024, 1024);

      const step = 64;
      ctx.strokeStyle = 'rgba(50, 30, 15, 0.45)';
      ctx.lineWidth = 2;

      for (let x = -1024; x < 2048; x += step) {
        ctx.beginPath();
        for (let y = 0; y < 1024; y += step) {
          const dir = ((x + y) / step) % 2 === 0 ? 1 : -1;
          ctx.moveTo(x, y);
          ctx.lineTo(x + step * dir, y + step);
        }
        ctx.stroke();
      }
      break;
    }

    case 'marble_carrara': {
      // Italian Carrara White Marble with delicate grey veins
      ctx.fillStyle = tintHex || '#f8fafc';
      ctx.fillRect(0, 0, 1024, 1024);

      // Organic subtle marble veins
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 3;
      ctx.filter = 'blur(1px)';

      const drawVein = (startX: number, startY: number, length: number) => {
        ctx.beginPath();
        let cx = startX;
        let cy = startY;
        ctx.moveTo(cx, cy);
        for (let i = 0; i < length; i++) {
          cx += (Math.random() - 0.4) * 40;
          cy += (Math.random() - 0.2) * 30;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      };

      for (let v = 0; v < 8; v++) {
        drawVein(Math.random() * 1024, Math.random() * 1024, 15);
      }
      ctx.filter = 'none';

      // Subtle marble tile grout lines (large 60x60cm format)
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1.5;
      for (let p = 0; p < 1024; p += 512) {
        ctx.strokeRect(p, 0, 512, 1024);
        ctx.strokeRect(0, p, 1024, 512);
      }
      break;
    }

    case 'ceramic_tile_grid': {
      // Modern 30x30 Ceramic White/Grey Tiles with clean grout lines
      ctx.fillStyle = tintHex || '#e2e8f0';
      ctx.fillRect(0, 0, 1024, 1024);

      const tileSize = 256;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let x = 0; x < 1024; x += tileSize) {
        for (let y = 0; y < 1024; y += tileSize) {
          ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        }
      }

      // Dark grout
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 3;
      for (let x = 0; x <= 1024; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
      break;
    }

    case 'brick_modern': {
      // Architectural Brick Wall
      ctx.fillStyle = tintHex || '#b91c1c';
      ctx.fillRect(0, 0, 1024, 1024);

      const bH = 48;
      const bW = 128;
      ctx.fillStyle = '#cbd5e1'; // Mortar
      for (let y = 0; y < 1024; y += bH) {
        ctx.fillRect(0, y, 1024, 4);
        const shift = (Math.floor(y / bH) % 2) * (bW / 2);
        for (let x = shift; x < 1024; x += bW) {
          ctx.fillRect(x, y, 4, bH);
        }
      }
      break;
    }

    case 'concrete_loft': {
      // Polished Industrial Concrete with micro-grit
      ctx.fillStyle = tintHex || '#94a3b8';
      ctx.fillRect(0, 0, 1024, 1024);

      // Noise speckles
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      // Large concrete pour seams (1m panels)
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 1024, 1024);
      break;
    }

    default: {
      // Plain solid with slight diffuse shading
      ctx.fillStyle = tintHex || '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  textureCache.set(cacheKey, texture);
  return texture;
}
