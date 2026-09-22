import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache for parsed GLTF scenes and geometries
const gltfLoader = new GLTFLoader();
const modelCache = new Map<string, THREE.Group>();
const pendingLoads = new Map<string, Promise<THREE.Group>>();

// Local file blob URL registry so users can upload .glb / .gltf / .obj files
const blobRegistry = new Map<string, string>();

export function registerLocalModelBlob(id: string, file: File | Blob): string {
  const blobUrl = URL.createObjectURL(file);
  const key = `blob_model:${id}`;
  blobRegistry.set(key, blobUrl);
  return blobUrl;
}

export function getLocalModelBlob(key: string): string | undefined {
  return blobRegistry.get(key);
}

/**
 * Loads a GLTF or GLB 3D model, scales it to match target real-world dimensions (w, d, h in cm),
 * centers it horizontally and rests it flush on the floor (y = 0).
 */
export async function loadGltfModel(
  url: string,
  targetWidthCm: number,
  targetDepthCm: number,
  targetHeightCm: number
): Promise<THREE.Group> {
  const CM = 0.01;
  const targetW = targetWidthCm * CM;
  const targetD = targetDepthCm * CM;
  const targetH = targetHeightCm * CM;

  let modelGroup: THREE.Group;

  if (modelCache.has(url)) {
    modelGroup = modelCache.get(url)!.clone(true);
  } else if (pendingLoads.has(url)) {
    const orig = await pendingLoads.get(url)!;
    modelGroup = orig.clone(true);
  } else {
    const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
      gltfLoader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          // Enable shadow casting and receiving on all child meshes
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          modelCache.set(url, group);
          resolve(group);
        },
        undefined,
        (err) => {
          console.warn(`Failed loading GLTF/GLB model from ${url}:`, err);
          reject(err);
        }
      );
    });

    pendingLoads.set(url, loadPromise);
    try {
      const orig = await loadPromise;
      modelGroup = orig.clone(true);
    } finally {
      pendingLoads.delete(url);
    }
  }

  // Compute unscaled bounding box
  const bbox = new THREE.Box3().setFromObject(modelGroup);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  // Auto-scale to fit target dimensions
  const scaleX = size.x > 0 ? targetW / size.x : 1;
  const scaleY = size.y > 0 ? targetH / size.y : 1;
  const scaleZ = size.z > 0 ? targetD / size.z : 1;

  // Use uniform scale or proportional bounding
  const container = new THREE.Group();
  modelGroup.scale.set(scaleX, scaleY, scaleZ);

  // Re-center so pivot is at bottom-center (0, 0, 0)
  modelGroup.position.set(-center.x * scaleX, -bbox.min.y * scaleY, -center.z * scaleZ);

  container.add(modelGroup);
  return container;
}
