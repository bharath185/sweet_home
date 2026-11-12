---
name: cad-2d-blueprints
description: Best practices and procedures for 2D architectural blueprint drafting, mitered wall CAD mesh, high-contrast wipeout plates, and export in DecoFrog 3D.
---

# 2D CAD Blueprint Engine Skill Guide: DecoFrog 3D

## 1. Continuous CAD Wall Mesh (`buildCADWallMesh`)
- Walls are rendered as continuous, mitered CAD polygonal meshes with closed outer corners.
- Solves L-corners, T-junctions, and multi-wall intersections with exact angle bisection.
- Corner junctions must inherit the wall's applied color (`jf.color || '#111827'`) to maintain monolithic visual harmony across 2D and 3D.

## 2. High-Readability Blueprint Typography & Labels
- All room labels, dimension values, and area texts must include a high-contrast background wipeout plate:
  - Rounded rectangular background pill (`rgba(255, 255, 255, 0.95)` or dark mode slate).
  - Subtle architectural border stroke (`rgba(100, 116, 139, 0.35)`).
- This ensures labels remain 100% legible even when rendered directly over dense furniture or wall intersections.

## 3. High-DPI Blueprint Export
- PDF, PNG, and SVG exports must use `expMesh` from `buildCADWallMesh` to ensure exported blueprints match the onscreen CAD canvas with zero corner notches or open gaps.
