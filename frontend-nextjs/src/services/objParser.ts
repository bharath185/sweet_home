import * as THREE from 'three';

const geometryCache = new Map<string, THREE.BufferGeometry>();
const loadingPromises = new Map<string, Promise<THREE.BufferGeometry>>();

export function registerCustomObjGeometry(id: string, textOrGeom: string | THREE.BufferGeometry): string {
  const key = id.startsWith('local_obj:') ? id : `local_obj:${id}`;
  if (typeof textOrGeom === 'string') {
    const geom = parseObjText(textOrGeom);
    geometryCache.set(key, geom);
    // Persist in localStorage so custom 3D models survive page refreshes and sessions!
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sweethome_geom_${key}`, textOrGeom);
      } catch (e) {
        console.warn('Could not cache OBJ in localStorage (quota may be full):', e);
      }
    }
  } else {
    geometryCache.set(key, textOrGeom);
  }
  return key;
}

export async function loadObjGeometry(url: string): Promise<THREE.BufferGeometry> {
  if (geometryCache.has(url)) {
    return geometryCache.get(url)!.clone();
  }

  if (url.startsWith('local_obj:')) {
    const cached = geometryCache.get(url);
    if (cached) return cached.clone();

    // Check localStorage for persisted geometry text across reloads
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`sweethome_geom_${url}`) || localStorage.getItem(url);
        if (stored) {
          const geom = parseObjText(stored);
          geometryCache.set(url, geom);
          return geom.clone();
        }
      } catch (e) {
        console.warn('Failed reading stored OBJ from localStorage:', e);
      }
    }
    return new THREE.BoxGeometry(1, 1, 1);
  }

  if (url.startsWith('data:')) {
    try {
      const base64Index = url.indexOf('base64,');
      let text = '';
      if (base64Index >= 0) {
        const b64Data = url.slice(base64Index + 7);
        text = decodeURIComponent(escape(atob(b64Data)));
      } else {
        text = decodeURIComponent(url.slice(url.indexOf(',') + 1));
      }
      const geom = parseObjText(text);
      geometryCache.set(url, geom);
      return geom.clone();
    } catch (e) {
      console.warn('Failed parsing data URI OBJ:', e);
      return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  if (loadingPromises.has(url)) {
    const geom = await loadingPromises.get(url)!;
    return geom.clone();
  }

  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch model at ${url}`);
      }
      const text = await response.text();
      const geom = parseObjText(text);
      geometryCache.set(url, geom);
      return geom;
    } catch (err) {
      console.warn(`Could not load OBJ from ${url}, falling back to box geometry.`, err);
      const fallback = new THREE.BoxGeometry(1, 1, 1);
      return fallback;
    } finally {
      loadingPromises.delete(url);
    }
  })();

  loadingPromises.set(url, promise);
  const result = await promise;
  return result.clone();
}

export function parseObjText(text: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const rawPositions: [number, number, number][] = [];
  const rawNormals: [number, number, number][] = [];
  const rawUvs: [number, number][] = [];

  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    const type = parts[0];

    if (type === 'v') {
      rawPositions.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (type === 'vn') {
      rawNormals.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3]),
      ]);
    } else if (type === 'vt') {
      rawUvs.push([
        parseFloat(parts[1]),
        parseFloat(parts[2]),
      ]);
    } else if (type === 'f') {
      // Handle polygons by triangulating fans
      const faceVertices = parts.slice(1);
      for (let j = 1; j < faceVertices.length - 1; j++) {
        addVertex(faceVertices[0], rawPositions, rawNormals, rawUvs, positions, normals, uvs);
        addVertex(faceVertices[j], rawPositions, rawNormals, rawUvs, positions, normals, uvs);
        addVertex(faceVertices[j + 1], rawPositions, rawNormals, rawUvs, positions, normals, uvs);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  if (normals.length > 0) {
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }

  if (uvs.length > 0) {
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  }

  // Normalize geometry orientation: SweetHome3D models are typically Y-up or Z-up
  geometry.center();
  geometry.computeBoundingBox();

  return geometry;
}

function addVertex(
  vertexStr: string,
  rawPositions: [number, number, number][],
  rawNormals: [number, number, number][],
  rawUvs: [number, number][],
  positions: number[],
  normals: number[],
  uvs: number[]
) {
  const parts = vertexStr.split('/');
  const posIndex = parseInt(parts[0], 10) - 1;
  const uvIndex = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
  const normIndex = parts[2] ? parseInt(parts[2], 10) - 1 : -1;

  if (rawPositions[posIndex]) {
    positions.push(...rawPositions[posIndex]);
  }

  if (uvIndex >= 0 && rawUvs[uvIndex]) {
    uvs.push(...rawUvs[uvIndex]);
  }

  if (normIndex >= 0 && rawNormals[normIndex]) {
    normals.push(...rawNormals[normIndex]);
  }
}
