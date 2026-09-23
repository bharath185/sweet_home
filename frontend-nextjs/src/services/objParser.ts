import * as THREE from 'three';

export interface ParsedObjPart {
  groupName: string;
  geometry: THREE.BufferGeometry;
}

export interface ParsedObjModel {
  parts: ParsedObjPart[];
  boundingBox: THREE.Box3;
  size: THREE.Vector3;
  combinedGeometry: THREE.BufferGeometry;
}

const geometryCache = new Map<string, THREE.BufferGeometry>();
const modelCache = new Map<string, ParsedObjModel>();
const loadingPromises = new Map<string, Promise<THREE.BufferGeometry>>();
const modelLoadingPromises = new Map<string, Promise<ParsedObjModel>>();

export function registerCustomObjGeometry(id: string, textOrGeom: string | THREE.BufferGeometry): string {
  const key = id.startsWith('local_obj:') ? id : `local_obj:${id}`;
  if (typeof textOrGeom === 'string') {
    const parsed = parseObjMultiPart(textOrGeom);
    geometryCache.set(key, parsed.combinedGeometry);
    modelCache.set(key, parsed);
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

export async function loadObjModel(url: string): Promise<ParsedObjModel> {
  if (modelCache.has(url)) {
    return cloneParsedObjModel(modelCache.get(url)!);
  }

  if (url.startsWith('local_obj:')) {
    const cached = modelCache.get(url);
    if (cached) return cloneParsedObjModel(cached);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`sweethome_geom_${url}`) || localStorage.getItem(url);
        if (stored) {
          const parsed = parseObjMultiPart(stored);
          modelCache.set(url, parsed);
          geometryCache.set(url, parsed.combinedGeometry);
          return cloneParsedObjModel(parsed);
        }
      } catch (e) {
        console.warn('Failed reading stored OBJ from localStorage:', e);
      }
    }
    return createBoxModelFallback();
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
      const parsed = parseObjMultiPart(text);
      modelCache.set(url, parsed);
      geometryCache.set(url, parsed.combinedGeometry);
      return cloneParsedObjModel(parsed);
    } catch (e) {
      console.warn('Failed parsing data URI OBJ:', e);
      return createBoxModelFallback();
    }
  }

  if (modelLoadingPromises.has(url)) {
    const m = await modelLoadingPromises.get(url)!;
    return cloneParsedObjModel(m);
  }

  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch model at ${url}`);
      }
      const text = await response.text();
      const parsed = parseObjMultiPart(text);
      modelCache.set(url, parsed);
      geometryCache.set(url, parsed.combinedGeometry);
      return parsed;
    } catch (err) {
      console.warn(`Could not load OBJ from ${url}, falling back to box model.`, err);
      return createBoxModelFallback();
    } finally {
      modelLoadingPromises.delete(url);
    }
  })();

  modelLoadingPromises.set(url, promise);
  const result = await promise;
  return cloneParsedObjModel(result);
}

export async function loadObjGeometry(url: string): Promise<THREE.BufferGeometry> {
  const model = await loadObjModel(url);
  return model.combinedGeometry.clone();
}

function cloneParsedObjModel(model: ParsedObjModel): ParsedObjModel {
  return {
    parts: model.parts.map((p) => ({
      groupName: p.groupName,
      geometry: p.geometry.clone(),
    })),
    boundingBox: model.boundingBox.clone(),
    size: model.size.clone(),
    combinedGeometry: model.combinedGeometry.clone(),
  };
}

function createBoxModelFallback(): ParsedObjModel {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  geom.computeBoundingBox();
  const box = geom.boundingBox || new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
  return {
    parts: [{ groupName: 'default', geometry: geom }],
    boundingBox: box,
    size: new THREE.Vector3(1, 1, 1),
    combinedGeometry: geom.clone(),
  };
}

export function parseObjMultiPart(text: string): ParsedObjModel {
  const rawPositions: [number, number, number][] = [];
  const rawNormals: [number, number, number][] = [];
  const rawUvs: [number, number][] = [];

  const groups = new Map<string, { positions: number[]; normals: number[]; uvs: number[] }>();
  let currentGroupName = 'default';

  function getGroup(name: string) {
    if (!groups.has(name)) {
      groups.set(name, { positions: [], normals: [], uvs: [] });
    }
    return groups.get(name)!;
  }

  const lines = text.split('\n');
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    const type = parts[0];

    if (type === 'v') {
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      rawPositions.push([x, y, z]);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    } else if (type === 'vn') {
      rawNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (type === 'vt') {
      rawUvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    } else if (type === 'g' || type === 'o') {
      const name = parts.slice(1).join(' ').trim();
      if (name) {
        currentGroupName = name;
      }
    } else if (type === 'f') {
      const gData = getGroup(currentGroupName);
      const faceVertices = parts.slice(1);
      for (let j = 1; j < faceVertices.length - 1; j++) {
        addVertexToGroup(faceVertices[0], rawPositions, rawNormals, rawUvs, gData);
        addVertexToGroup(faceVertices[j], rawPositions, rawNormals, rawUvs, gData);
        addVertexToGroup(faceVertices[j + 1], rawPositions, rawNormals, rawUvs, gData);
      }
    }
  }

  if (!isFinite(minX)) {
    return createBoxModelFallback();
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const sizeX = Math.max(0.001, maxX - minX);
  const sizeY = Math.max(0.001, maxY - minY);
  const sizeZ = Math.max(0.001, maxZ - minZ);

  const boundingBox = new THREE.Box3(
    new THREE.Vector3(-sizeX / 2, -sizeY / 2, -sizeZ / 2),
    new THREE.Vector3(sizeX / 2, sizeY / 2, sizeZ / 2)
  );
  const size = new THREE.Vector3(sizeX, sizeY, sizeZ);

  const parts: ParsedObjPart[] = [];
  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allUvs: number[] = [];

  for (const [groupName, gData] of groups.entries()) {
    if (gData.positions.length === 0) continue;

    // Center vertices relative to model's bounding box center
    for (let p = 0; p < gData.positions.length; p += 3) {
      gData.positions[p] -= centerX;
      gData.positions[p + 1] -= centerY;
      gData.positions[p + 2] -= centerZ;
    }

    allPositions.push(...gData.positions);
    allNormals.push(...gData.normals);
    allUvs.push(...gData.uvs);

    const partGeom = new THREE.BufferGeometry();
    partGeom.setAttribute('position', new THREE.Float32BufferAttribute(gData.positions, 3));
    if (gData.normals.length > 0) {
      partGeom.setAttribute('normal', new THREE.Float32BufferAttribute(gData.normals, 3));
    } else {
      partGeom.computeVertexNormals();
    }
    if (gData.uvs.length > 0) {
      partGeom.setAttribute('uv', new THREE.Float32BufferAttribute(gData.uvs, 2));
    }

    parts.push({
      groupName,
      geometry: partGeom,
    });
  }

  // Combined geometry for backward compatibility
  const combinedGeom = new THREE.BufferGeometry();
  combinedGeom.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3));
  if (allNormals.length > 0) {
    combinedGeom.setAttribute('normal', new THREE.Float32BufferAttribute(allNormals, 3));
  } else {
    combinedGeom.computeVertexNormals();
  }
  if (allUvs.length > 0) {
    combinedGeom.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2));
  }

  return {
    parts: parts.length > 0 ? parts : [{ groupName: 'default', geometry: combinedGeom }],
    boundingBox,
    size,
    combinedGeometry: combinedGeom,
  };
}

export function parseObjText(text: string): THREE.BufferGeometry {
  const parsed = parseObjMultiPart(text);
  return parsed.combinedGeometry;
}

function addVertexToGroup(
  vertexStr: string,
  rawPositions: [number, number, number][],
  rawNormals: [number, number, number][],
  rawUvs: [number, number][],
  group: { positions: number[]; normals: number[]; uvs: number[] }
) {
  const parts = vertexStr.split('/');
  const posIndex = parseInt(parts[0], 10) - 1;
  const uvIndex = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
  const normIndex = parts[2] ? parseInt(parts[2], 10) - 1 : -1;

  if (rawPositions[posIndex]) {
    group.positions.push(...rawPositions[posIndex]);
  }

  if (uvIndex >= 0 && rawUvs[uvIndex]) {
    group.uvs.push(...rawUvs[uvIndex]);
  }

  if (normIndex >= 0 && rawNormals[normIndex]) {
    group.normals.push(...rawNormals[normIndex]);
  }
}
