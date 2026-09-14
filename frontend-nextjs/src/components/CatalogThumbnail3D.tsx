'use client';

import React, { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import {
  buildProceduralMeshGroup,
  buildTableMeshGroup,
  buildChairMeshGroup,
  buildSofaMeshGroup,
  buildCabinetMeshGroup,
  buildBedMeshGroup,
  buildLampMeshGroup,
  buildDoorMeshGroup,
  buildWindowMeshGroup,
  buildInteriorDecorMeshGroup,
} from '../services/proceduralFurniture';
import { loadObjGeometry } from '../services/objParser';

interface CatalogThumbnail3DProps {
  model?: string;
  category?: string;
  name?: string;
  width: number;
  depth: number;
  height: number;
  color?: string;
  size?: number;
}

const CM = 0.01;

function buildSmartArchetypeFallback(
  name: string,
  category: string,
  wCm: number,
  dCm: number,
  hCm: number,
  material: THREE.Material
): THREE.Group {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  try {
    if (lowerName.includes('chair') || lowerName.includes('armchair') || lowerName.includes('stool')) {
      return buildChairMeshGroup(
        {
          seatType: 'cushioned',
          backrestStyle: lowerName.includes('armchair') ? 'wingback' : 'solid_panel',
          legStyle: 'straight_4',
          width: wCm,
          depth: dCm,
          height: hCm,
          seatHeight: Math.min(45, hCm * 0.5),
        },
        material
      );
    }

    if (lowerName.includes('sofa') || lowerName.includes('couch') || lowerName.includes('lounge') || lowerName.includes('sectional')) {
      return buildSofaMeshGroup(
        {
          type: 'straight_2_seater',
          cushionStyle: 'plump',
          armStyle: 'track_arm',
          legStyle: 'wooden_pegs',
          width: wCm,
          depth: dCm,
          height: hCm,
        },
        material
      );
    }

    if (lowerName.includes('table') || lowerName.includes('desk') || lowerName.includes('stand')) {
      return buildTableMeshGroup(
        {
          shape: lowerName.includes('round') ? 'round' : 'rectangular',
          legStyle: '4_legs_corner',
          topThickness: 4,
          legThickness: 5,
          bevel: true,
          width: wCm,
          depth: dCm,
          height: hCm,
        },
        material
      );
    }

    if (lowerName.includes('bed') || lowerCat === 'bedroom') {
      return buildBedMeshGroup(
        {
          headboardStyle: 'tufted',
          frameStyle: 'platform',
          width: wCm,
          depth: dCm,
          height: hCm,
          hasNightstands: false,
        },
        material
      );
    }

    if (lowerCat === 'kitchen' || lowerName.includes('cabinet') || lowerName.includes('wardrobe') || lowerName.includes('chest') || lowerName.includes('drawer')) {
      return buildCabinetMeshGroup(
        {
          columns: 2,
          rows: 2,
          doorType: 'solid_doors',
          width: wCm,
          depth: dCm,
          height: hCm,
          hasLegs: true,
        },
        material
      );
    }

    if (lowerCat === 'lighting' || lowerName.includes('lamp') || lowerName.includes('light')) {
      return buildLampMeshGroup(
        {
          type: 'table_lamp',
          shadeWidth: wCm,
          shadeHeight: dCm,
          totalHeight: hCm,
        },
        material
      );
    }

    if (lowerCat === 'doors & windows' || lowerName.includes('door') || lowerName.includes('window')) {
      if (lowerName.includes('window')) {
        return buildWindowMeshGroup(
          {
            type: 'modern_sliding',
            width: wCm,
            depth: dCm,
            height: hCm,
          },
          material
        );
      }
      return buildDoorMeshGroup(
        {
          type: 'modern_flush',
          width: wCm,
          depth: dCm,
          height: hCm,
        },
        material
      );
    }

    if (lowerCat === 'decor & plants' || lowerName.includes('plant') || lowerName.includes('decor')) {
      return buildInteriorDecorMeshGroup(
        {
          type: 'potted_plant',
          width: wCm,
          depth: dCm,
          height: hCm,
        },
        material
      );
    }
  } catch (e) {
    console.warn('Fallback error:', e);
  }

  // Soft rounded box fallback with legs
  const grp = new THREE.Group();
  const boxGeom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
  const boxMesh = new THREE.Mesh(boxGeom, material);
  boxMesh.position.y = (hCm * CM) / 2;
  grp.add(boxMesh);
  return grp;
}

const CatalogThumbnail3DInner: React.FC<CatalogThumbnail3DProps> = ({
  model,
  category = 'Living',
  name = 'Furniture Item',
  width: wCm,
  depth: dCm,
  height: hCm,
  color = '#94a3b8',
  size = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x93c5fd, 0.6);
      fill.position.set(-3, 2, -2);
      scene.add(fill);

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const maxDim = Math.max(wCm, dCm, hCm) * CM;
      const dist = Math.max(1.5, maxDim * 3.2);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

      const phi = 1.05;
      const theta = 0.75;
      camera.position.set(
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, (hCm * CM) / 2, 0);

      const group = new THREE.Group();
      scene.add(group);

      const renderNow = () => {
        if (!isDisposed && renderer) {
          renderer.render(scene, camera);
        }
      };

      if (model && model.startsWith('procedural:')) {
        try {
          const parts = model.split(':');
          const pType = parts[1];
          const rawParams = parts.slice(2).join(':');
          const parsed = rawParams ? JSON.parse(rawParams) : {};
          const procGroup = buildProceduralMeshGroup(pType, parsed, wCm, dCm, hCm, material);
          group.add(procGroup);
          renderNow();
        } catch {
          const fallbackGroup = buildSmartArchetypeFallback(name, category, wCm, dCm, hCm, material);
          group.add(fallbackGroup);
          renderNow();
        }
      } else if (
        model &&
        (model.endsWith('.obj') || model.startsWith('local_obj:') || model.startsWith('data:'))
      ) {
        // First show smart archetype immediately so user never sees blank space or box
        const initialFallback = buildSmartArchetypeFallback(name, category, wCm, dCm, hCm, material);
        group.add(initialFallback);
        renderNow();

        // Then asynchronously load the full OBJ
        loadObjGeometry(model)
          .then((geom) => {
            if (isDisposed) return;
            geom.computeBoundingBox();
            const bbox = geom.boundingBox!;
            const s = new THREE.Vector3();
            bbox.getSize(s);

            const targetW = wCm * CM;
            const targetD = dCm * CM;
            const targetH = hCm * CM;

            const scaleX = s.x > 0 ? targetW / s.x : targetW;
            const scaleY = s.y > 0 ? targetH / s.y : targetH;
            const scaleZ = s.z > 0 ? targetD / s.z : targetD;

            const mesh = new THREE.Mesh(geom, material);
            mesh.scale.set(scaleX, scaleY, scaleZ);
            mesh.position.y = targetH / 2;

            // Clear fallback and add real OBJ
            while (group.children.length > 0) {
              group.remove(group.children[0]);
            }
            group.add(mesh);
            renderNow();
          })
          .catch(() => {
            // Keep smart archetype fallback
          });
      } else {
        const fallbackGroup = buildSmartArchetypeFallback(name, category, wCm, dCm, hCm, material);
        group.add(fallbackGroup);
        renderNow();
      }
    } catch (e) {
      console.warn('Thumbnail render error:', e);
    }

    return () => {
      isDisposed = true;
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [model, category, name, wCm, dCm, hCm, color, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-sm"
      style={{ width: size, height: size }}
    />
  );
};

export const CatalogThumbnail3D = memo(CatalogThumbnail3DInner);
