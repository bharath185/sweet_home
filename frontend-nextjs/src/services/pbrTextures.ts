import * as THREE from 'three';

// Cache generated textures in memory to avoid rebuilding every frame
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

export type PBRTextureId =
  | 'hardwood_oak'
  | 'wood_oak'
  | 'parquet_oak'
  | 'hardwood_walnut'
  | 'wood_walnut'
  | 'herringbone'
  | 'wood_parquet'
  | 'marble_carrara'
  | 'tile_subway'
  | 'ceramic_tile_grid'
  | 'brick_red'
  | 'brick_modern'
  | 'brick_white'
  | 'brick_dark'
  | 'brick_rustic'
  | 'stone_slate'
  | 'wood_slat'
  | 'concrete_loft'
  | 'royale_play_blue'
  | 'royale_play_azure'
  | 'royale_play_green'
  | 'royale_play_ochre'
  | 'royale_play_salmon'
  | 'royale_play_yellow';

export const ROYALE_PLAY_WALL_PRESETS = [
  { id: 'royale_play_blue', name: 'Cobalt Sponge (Royale Play)', color: '#1e3a8a', url: '/textures/dark-blue-sponge-wallpaint.jpg' },
  { id: 'royale_play_azure', name: 'Royal Azure (Royale Play)', color: '#0284c7', url: '/textures/balanced-blue-sponge-wallpaint.jpg' },
  { id: 'royale_play_green', name: 'Emerald Velvet (Royale Play)', color: '#065f46', url: '/textures/dark-green-sponge-wallpaint.jpg' },
  { id: 'royale_play_ochre', name: 'Safari Ochre (Royale Play)', color: '#78350f', url: '/textures/brown-sponge-wallpaint.jpg' },
  { id: 'royale_play_salmon', name: 'Coral Terracotta (Royale Play)', color: '#9a3412', url: '/textures/salmon-sponge-wallpaint.jpg' },
  { id: 'royale_play_yellow', name: 'Sunshine Gold (Royale Play)', color: '#ca8a04', url: '/textures/pastel-yellow-sponge-wallpaint.jpg' },
];

export const BRICK_WALL_PRESETS = [
  { id: 'brick_red', name: 'Red Loft Brick', color: '#b91c1c' },
  { id: 'brick_white', name: 'White Painted Brick', color: '#e2e8f0' },
  { id: 'brick_dark', name: 'Charcoal Industrial Brick', color: '#334155' },
  { id: 'brick_rustic', name: 'Terracotta Rustic Brick', color: '#9a3412' },
  { id: 'stone_slate', name: 'Stacked Slate Stone', color: '#475569' },
  { id: 'wood_slat', name: 'Vertical Timber Slats', color: '#d4a373' },
];

/**
 * Creates or loads high-detail PBR textures for architectural surfaces.
 */
export function getProceduralTexture(textureType: string, tintHex?: string): THREE.Texture {
  const cacheKey = `${textureType}_${tintHex || 'default'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Check if texture is an explicit image URL or Royale Play preset mapping
  const rpPreset = ROYALE_PLAY_WALL_PRESETS.find((p) => p.id === textureType);
  const imageUrl = rpPreset ? rpPreset.url : textureType.startsWith('/') ? textureType : null;

  if (imageUrl) {
    const loadedTex = textureLoader.load(imageUrl);
    loadedTex.wrapS = THREE.RepeatWrapping;
    loadedTex.wrapT = THREE.RepeatWrapping;
    loadedTex.repeat.set(3, 3);
    loadedTex.generateMipmaps = true;
    loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
    textureCache.set(cacheKey, loadedTex);
    return loadedTex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  switch (textureType) {
    case 'wood_oak':
    case 'hardwood_oak':
    case 'parquet_oak': {
      ctx.fillStyle = tintHex || '#d4a373';
      ctx.fillRect(0, 0, 1024, 1024);

      const plankHeight = 64;
      for (let y = 0; y < 1024; y += plankHeight) {
        ctx.fillStyle = 'rgba(60, 35, 20, 0.45)';
        ctx.fillRect(0, y, 1024, 2);

        const offsetX = (Math.floor(y / plankHeight) % 3) * 340;
        for (let x = offsetX; x < 1024; x += 340) {
          ctx.fillRect(x, y, 2, plankHeight);
        }

        ctx.fillStyle = 'rgba(90, 50, 25, 0.08)';
        for (let g = 0; g < 6; g++) {
          const gy = y + 8 + g * 8;
          ctx.fillRect(0, gy, 1024, 1.5);
        }
      }
      break;
    }

    case 'wood_walnut':
    case 'hardwood_walnut': {
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

    case 'wood_parquet':
    case 'herringbone': {
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
      ctx.fillStyle = tintHex || '#f8fafc';
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 3;

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

      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1.5;
      for (let p = 0; p < 1024; p += 512) {
        ctx.strokeRect(p, 0, 512, 1024);
        ctx.strokeRect(0, p, 1024, 512);
      }
      break;
    }

    case 'ceramic_tile_grid':
    case 'tile_subway': {
      ctx.fillStyle = tintHex || '#e2e8f0';
      ctx.fillRect(0, 0, 1024, 1024);

      const tileSize = 256;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let x = 0; x < 1024; x += tileSize) {
        for (let y = 0; y < 1024; y += tileSize) {
          ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
        }
      }

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

    case 'brick_red':
    case 'brick_modern':
    case 'brick_rustic': {
      ctx.fillStyle = '#cbd5e1'; // Mortar grey
      ctx.fillRect(0, 0, 1024, 1024);

      const bH = 56;
      const bW = 140;
      const mortarG = 5;

      for (let y = 0; y < 1024; y += bH) {
        const rowIdx = Math.floor(y / bH);
        const shift = (rowIdx % 2) * (bW / 2);
        for (let x = -bW; x < 1024 + bW; x += bW) {
          const rand = Math.sin(rowIdx * 12.5 + x * 0.05);
          const rHue = Math.floor(165 + rand * 25);
          const gHue = Math.floor(30 + rand * 15);
          const bHue = Math.floor(25 + rand * 12);
          ctx.fillStyle = `rgb(${rHue}, ${gHue}, ${bHue})`;

          const bx = x + shift + mortarG / 2;
          const bw = bW - mortarG;
          const bh = bH - mortarG;
          ctx.fillRect(bx, y + mortarG / 2, bw, bh);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(bx, y + mortarG / 2, bw, 3);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(bx, y + bH - mortarG / 2 - 3, bw, 3);
        }
      }

      for (let i = 0; i < 15000; i++) {
        const nx = Math.random() * 1024;
        const ny = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(nx, ny, 2, 2);
      }
      break;
    }

    case 'brick_white': {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 1024, 1024);

      const bH = 56;
      const bW = 140;
      const mortarG = 4;

      for (let y = 0; y < 1024; y += bH) {
        const rowIdx = Math.floor(y / bH);
        const shift = (rowIdx % 2) * (bW / 2);
        for (let x = -bW; x < 1024 + bW; x += bW) {
          const rand = Math.sin(rowIdx * 7.5 + x * 0.08);
          const shade = Math.floor(242 + rand * 12);
          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 5})`;

          const bx = x + shift + mortarG / 2;
          const bw = bW - mortarG;
          const bh = bH - mortarG;
          ctx.fillRect(bx, y + mortarG / 2, bw, bh);

          ctx.fillStyle = 'rgba(100, 116, 139, 0.18)';
          ctx.fillRect(bx, y + bH - mortarG / 2 - 2, bw, 2);
        }
      }
      break;
    }

    case 'brick_dark': {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1024, 1024);

      const bH = 56;
      const bW = 140;
      const mortarG = 5;

      for (let y = 0; y < 1024; y += bH) {
        const rowIdx = Math.floor(y / bH);
        const shift = (rowIdx % 2) * (bW / 2);
        for (let x = -bW; x < 1024 + bW; x += bW) {
          const rand = Math.sin(rowIdx * 14.1 + x * 0.03);
          const shade = Math.floor(45 + rand * 20);
          ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 10})`;

          const bx = x + shift + mortarG / 2;
          const bw = bW - mortarG;
          const bh = bH - mortarG;
          ctx.fillRect(bx, y + mortarG / 2, bw, bh);
        }
      }
      break;
    }

    case 'stone_slate': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 1024, 1024);

      const layers = 32;
      const layerH = 1024 / layers;
      for (let y = 0; y < 1024; y += layerH) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(0, y, 1024, 3);

        let x = 0;
        while (x < 1024) {
          const stoneW = 80 + Math.random() * 160;
          const randShade = Math.floor(60 + Math.random() * 50);
          ctx.fillStyle = `rgb(${randShade}, ${randShade + 5}, ${randShade + 12})`;
          ctx.fillRect(x + 2, y + 3, stoneW - 4, layerH - 3);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(x + 2, y + 3, stoneW - 4, 2);
          x += stoneW;
        }
      }
      break;
    }

    case 'wood_slat': {
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(0, 0, 1024, 1024);

      const slatW = 48;
      const gapW = 12;
      const step = slatW + gapW;

      for (let x = 0; x < 1024; x += step) {
        const grad = ctx.createLinearGradient(x, 0, x + slatW, 0);
        grad.addColorStop(0, '#d4a373');
        grad.addColorStop(0.5, '#e6ccb2');
        grad.addColorStop(1, '#b07d4f');

        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, slatW, 1024);

        ctx.fillStyle = 'rgba(60, 35, 20, 0.1)';
        for (let g = 0; g < 4; g++) {
          ctx.fillRect(x + 6 + g * 10, 0, 1.5, 1024);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, 0, 2, 1024);
      }
      break;
    }

    case 'concrete_loft': {
      ctx.fillStyle = tintHex || '#94a3b8';
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 1024, 1024);
      break;
    }

    case 'royale_play_blue':
    case 'royale_play_azure':
    case 'royale_play_green':
    case 'royale_play_ochre':
    case 'royale_play_salmon':
    case 'royale_play_yellow': {
      const baseColors: Record<string, string> = {
        royale_play_blue: '#1e3a8a',
        royale_play_azure: '#0284c7',
        royale_play_green: '#065f46',
        royale_play_ochre: '#78350f',
        royale_play_salmon: '#9a3412',
        royale_play_yellow: '#ca8a04',
      };
      const baseColor = tintHex || baseColors[textureType] || '#0284c7';
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 4000; i++) {
        const sx = Math.random() * 1024;
        const sy = Math.random() * 1024;
        const radius = 6 + Math.random() * 18;
        const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, radius);
        grad.addColorStop(0, Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.28)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default: {
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
