---
name: threejs-cad-engine
description: Expert guidelines and procedures for Three.js 3D studio rendering, world-metric UV mapping, procedural PBR materials, and wall cutouts in DecoFrog 3D.
---

# Three.js CAD Engine Skill Guide: DecoFrog 3D

## 1. World-Metric UV Coordinate System
Whenever generating or updating architectural wall geometries (`BoxGeometry` for walls, cutouts, lintels, and sills):
- **NEVER** rely on default box UV coordinates `(0, 0) to (1, 1)` on partitioned sub-boxes.
- **ALWAYS** compute world-metric UV coordinates based on actual vertex positions along the wall span in meters:
  ```typescript
  // Front / Back wall surfaces (along wall span X and height Y)
  const wallX = startX + (px + boxWidth / 2);
  const wallY = startY + (py + boxHeight / 2);
  u = wallX * scale;
  v = wallY * scale;
  ```
- Keep `wallTex.repeat.set(1, 1)` so the geometry's UVs control the exact real-world scale consistently.

## 2. Procedural PBR Material Rules
- **Color Multiplication Guard**: In Three.js, diffuse color is `material.color × texture.map`.
- For paint walls: Use a neutral white eggshell stipple texture with `material.color = new THREE.Color(wall.color)` to guarantee 100% color fidelity.
- For procedural presets (Asian Paints Royale Play, Royal Ply, Bricks): The texture canvas is baked with the preset base color; use `material.color = 0xffffff`.
- **Emissive Isolation**: Walls must NEVER receive selection emissive tints (`mat.emissive.setHex(0x000000)`). Selection must be rendered strictly via outer perimeter CAD wireframes (`EdgesGeometry`).

## 3. Wall Cutouts & Openings
- Solid wall sections, lintels, and sills must share the parent `wallGroup`.
- Never attach `EdgesGeometry` to internal sub-meshes (avoids vertical/horizontal dividing seam lines).
- Attach selection wireframes only as a single bounding box to the parent `wallGroup`.
