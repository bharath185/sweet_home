'use client';

import React, { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import { buildProceduralMeshGroup } from '../services/proceduralFurniture';

interface CatalogThumbnail3DProps {
  model?: string;
  width: number;
  depth: number;
  height: number;
  color?: string;
  size?: number; // pixel dimension of the thumbnail canvas (square)
}

const CM = 0.01;

/**
 * Renders a tiny static 3D thumbnail of a catalog item.
 * Uses an offscreen THREE.WebGLRenderer that draws a single frame and then
 * disposes all GPU resources — no animation loop, no event listeners.
 * The result is a `<canvas>` element with a fixed isometric snapshot.
 */
const CatalogThumbnail3DInner: React.FC<CatalogThumbnail3DProps> = ({
  model,
  width: wCm,
  depth: dCm,
  height: hCm,
  color = '#94a3b8',
  size = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent double render in strict-mode dev
    if (renderedRef.current) return;
    renderedRef.current = true;

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      // ---- Renderer (uses the existing canvas element) ----
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      renderer.setClearColor(0x000000, 0); // transparent background

      // ---- Scene ----
      const scene = new THREE.Scene();

      // ---- Lighting (simple studio) ----
      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.3);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x93c5fd, 0.5);
      fill.position.set(-3, 2, -2);
      scene.add(fill);

      // ---- Material ----
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      // ---- Build geometry ----
      const group = new THREE.Group();

      if (model && model.startsWith('procedural:')) {
        try {
          const parts = model.split(':');
          const pType = parts[1];
          const rawParams = parts.slice(2).join(':');
          const parsed = rawParams ? JSON.parse(rawParams) : {};
          const procGroup = buildProceduralMeshGroup(pType, parsed, wCm, dCm, hCm, material);
          group.add(procGroup);
        } catch {
          const geom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
          const mesh = new THREE.Mesh(geom, material);
          mesh.position.y = (hCm * CM) / 2;
          group.add(mesh);
        }
      } else {
        // Fallback: simple box
        const geom = new THREE.BoxGeometry(wCm * CM, hCm * CM, dCm * CM);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.y = (hCm * CM) / 2;
        group.add(mesh);
      }

      scene.add(group);

      // ---- Camera (isometric-like) ----
      const maxDim = Math.max(wCm, dCm, hCm) * CM;
      const dist = Math.max(1.5, maxDim * 3.2);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

      const phi = 1.05;
      const theta = 0.75;
      const cx = dist * Math.sin(phi) * Math.sin(theta);
      const cy = dist * Math.cos(phi);
      const cz = dist * Math.sin(phi) * Math.cos(theta);
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, (hCm * CM) / 2, 0);

      // ---- Single-frame render ----
      renderer.render(scene, camera);

      // ---- Cleanup GPU resources ----
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else if (m.material) {
            m.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer = null;
    } catch {
      // Silently fail — the card will just show a transparent canvas
      if (renderer) {
        renderer.dispose();
      }
    }

    return () => {
      renderedRef.current = false;
    };
  }, [model, wCm, dCm, hCm, color, size]);

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
