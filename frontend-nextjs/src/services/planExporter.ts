import { HomePlan } from '../types/plan';
import { buildCADWallMesh } from './cadWallMesh';

export function exportPlanSvg(plan: HomePlan, activeFloor: number = 0) {
  const flRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
  const flWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
  const flFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false);
  const flDims = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === activeFloor);

  let minX = -400, maxX = 400, minY = -300, maxY = 300;
  flRooms.forEach((r) => r.points.forEach((p) => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }));
  flWalls.forEach((w) => {
    minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd);
    minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd);
  });

  const width = maxX - minX + 160;
  const height = maxY - minY + 160;
  const viewBox = (minX - 80) + ' ' + (minY - 80) + ' ' + width + ' ' + height;

  let svg = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '" width="' + (width * 2) + 'px" height="' + (height * 2) + 'px" style="background:#ffffff; font-family:system-ui, sans-serif;">\n' +
    '  <defs>\n' +
    '    <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">\n' +
    '      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.5"/>\n' +
    '    </pattern>\n' +
    '  </defs>\n' +
    '  <rect x="' + (minX - 80) + '" y="' + (minY - 80) + '" width="' + width + '" height="' + height + '" fill="url(#cadGrid)" />\n';

  // Rooms (Crisp White CAD Floors - Image 2)
  flRooms.forEach((r) => {
    if (r.points.length < 3) return;
    const pts = r.points.map((p) => p.x + ',' + p.y).join(' ');
    svg += '  <polygon points="' + pts + '" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />\n';

    // Room Label
    const avgX = r.points.reduce((acc, p) => acc + p.x, 0) / r.points.length;
    const avgY = r.points.reduce((acc, p) => acc + p.y, 0) / r.points.length;
    svg += '  <text x="' + avgX + '" y="' + (avgY - 4) + '" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle" font-family="system-ui, sans-serif">' + r.name.toUpperCase() + '</text>\n';
    svg += '  <text x="' + avgX + '" y="' + (avgY + 7) + '" font-size="7.5" font-weight="600" fill="#475569" text-anchor="middle" font-family="monospace">' + (r.areaSquareMeters || 12.5) + ' m²</text>\n';
  });

  // Walls (Solid Dark Charcoal Architectural - Image 2)
  flWalls.forEach((w) => {
    svg += '  <line x1="' + w.xStart + '" y1="' + w.yStart + '" x2="' + w.xEnd + '" y2="' + w.yEnd + '" stroke="#111827" stroke-width="' + (w.thickness || 15) + '" stroke-linecap="square" />\n';
  });

  // Furniture
  flFurniture.forEach((f) => {
    svg += '  <g transform="translate(' + f.x + ', ' + f.y + ') rotate(' + (((f.angle || 0) * 180) / Math.PI) + ')">\n';
    svg += '    <rect x="' + (-f.width / 2) + '" y="' + (-f.depth / 2) + '" width="' + f.width + '" height="' + f.depth + '" rx="4" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />\n';
    svg += '    <text x="0" y="4" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">' + f.name + '</text>\n';
    svg += '  </g>\n';
  });

  // Dimensions
  flDims.forEach((d) => {
    svg += '  <line x1="' + d.xStart + '" y1="' + d.yStart + '" x2="' + d.xEnd + '" y2="' + d.yEnd + '" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,2" />\n';
  });

  svg += '</svg>';

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeProjectName = (plan.name || 'Floorplan').replace(/\s+/g, '_');
  link.download = safeProjectName + '_Floor_' + activeFloor + '_Vector.svg';
  link.click();
  URL.revokeObjectURL(url);
}

export function exportPlan4kPng(plan: HomePlan, activeFloor: number = 0) {
  const allFloors = plan.floors && plan.floors.length > 0 ? plan.floors : [
    { level: 0, name: 'Ground Floor' },
    { level: 1, name: '1st Floor' },
  ];
  const flObj = allFloors.find((f) => f.level === activeFloor) || {
    level: activeFloor,
    name: activeFloor === 0 ? 'Ground Floor' : '1st Floor',
  };
  const floorDisplayName = flObj.level === 0 ? 'Ground Floor' : flObj.level === 1 ? '1st Floor' : (flObj.name || ('Floor ' + flObj.level));

  const expWalls = plan.walls.filter((w) => (w.floorLevel ?? 0) === activeFloor);
  const expRooms = plan.rooms.filter((r) => (r.floorLevel ?? 0) === activeFloor);
  const expFurniture = plan.furniture.filter((f) => (f.floorLevel ?? 0) === activeFloor && f.isVisible !== false);
  const expDimensions = (plan.dimensionLines || []).filter((d) => (d.floorLevel ?? 0) === activeFloor);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  expRooms.forEach((r) => r.points.forEach((p) => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }));
  expWalls.forEach((w) => {
    minX = Math.min(minX, w.xStart, w.xEnd); maxX = Math.max(maxX, w.xStart, w.xEnd);
    minY = Math.min(minY, w.yStart, w.yEnd); maxY = Math.max(maxY, w.yStart, w.yEnd);
  });
  expFurniture.forEach((f) => {
    minX = Math.min(minX, f.x - f.width / 2); maxX = Math.max(maxX, f.x + f.width / 2);
    minY = Math.min(minY, f.y - f.depth / 2); maxY = Math.max(maxY, f.y + f.depth / 2);
  });

  if (minX === Infinity) { minX = -350; maxX = 350; minY = -250; maxY = 250; }

  const marginCm = 120;
  const planW = (maxX - minX) + marginCm * 2;
  const planH = (maxY - minY) + marginCm * 2;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const exportCanvas = document.createElement('canvas');
  const width = 3840;
  const height = 2160;
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ectx = exportCanvas.getContext('2d');
  if (!ectx) return;

  ectx.imageSmoothingEnabled = true;
  ectx.imageSmoothingQuality = 'high';

  ectx.fillStyle = '#ffffff';
  ectx.fillRect(0, 0, width, height);

  // Grid
  ectx.strokeStyle = '#f1f5f9';
  ectx.lineWidth = 1.5;
  for (let gx = 0; gx < width; gx += 40) { ectx.beginPath(); ectx.moveTo(gx, 0); ectx.lineTo(gx, height); ectx.stroke(); }
  for (let gy = 0; gy < height; gy += 40) { ectx.beginPath(); ectx.moveTo(0, gy); ectx.lineTo(width, gy); ectx.stroke(); }

  // Border
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 4;
  ectx.strokeRect(60, 60, width - 120, height - 120);
  ectx.lineWidth = 1.5;
  ectx.strokeRect(72, 72, width - 144, height - 144);

  const printableW = width - 360;
  const printableH = height - 360;
  const hdScale = Math.min(printableW / planW, printableH / planH);
  const sheetCenterX = width / 2;
  const sheetCenterY = height / 2 - 30;

  const toHDScreen = (x: number, y: number) => ({
    x: sheetCenterX + (x - centerX) * hdScale,
    y: sheetCenterY + (y - centerY) * hdScale,
  });

  // Draw Rooms (Crisp White Floors CAD Style - Image 2)
  expRooms.forEach((room) => {
    if (room.points.length < 3) return;
    const isDefaultFloor = !room.floorColor || room.floorColor === 'rgba(14, 165, 233, 0.06)' || room.floorColor === '#2c3e50' || room.floorColor === 'rgba(240, 249, 255, 0.7)';
    ectx.fillStyle = isDefaultFloor ? '#ffffff' : room.floorColor;
    ectx.strokeStyle = '#cbd5e1';
    ectx.lineWidth = 2;
    ectx.beginPath();
    const p0 = toHDScreen(room.points[0].x, room.points[0].y);
    ectx.moveTo(p0.x, p0.y);
    for (let i = 1; i < room.points.length; i++) {
      const p = toHDScreen(room.points[i].x, room.points[i].y);
      ectx.lineTo(p.x, p.y);
    }
    ectx.closePath();
    ectx.fill();
    ectx.stroke();

    // Diagonal Cross 'X' for Open/Wash Area/Shaft/OTS/Balcony
    const rUpper = room.name.toUpperCase();
    if (rUpper.includes('WASH') || rUpper.includes('OPEN') || rUpper.includes('SHAFT') || rUpper.includes('OTS') || rUpper.includes('CUTOUT')) {
      let rMinX = Infinity, rMinY = Infinity, rMaxX = -Infinity, rMaxY = -Infinity;
      room.points.forEach((pt) => {
        const sp = toHDScreen(pt.x, pt.y);
        if (sp.x < rMinX) rMinX = sp.x;
        if (sp.y < rMinY) rMinY = sp.y;
        if (sp.x > rMaxX) rMaxX = sp.x;
        if (sp.y > rMaxY) rMaxY = sp.y;
      });
      ectx.save();
      ectx.strokeStyle = '#94a3b8';
      ectx.lineWidth = 1.5;
      ectx.beginPath();
      ectx.moveTo(rMinX + 4, rMinY + 4);
      ectx.lineTo(rMaxX - 4, rMaxY - 4);
      ectx.moveTo(rMaxX - 4, rMinY + 4);
      ectx.lineTo(rMinX + 4, rMaxY - 4);
      ectx.stroke();
      ectx.restore();
    }

    const avgX = room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length;
    const avgY = room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length;
    const roomCenter = toHDScreen(avgX, avgY);

    let expPrimary = room.name.toUpperCase();
    let expDim = '';
    const expMatch = room.name.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (expMatch) {
      expPrimary = expMatch[1].trim().toUpperCase();
      expDim = expMatch[2].trim().toUpperCase();
    }

    let expDimStr = expDim;
    if (!expDimStr) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      room.points.forEach((pt) => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
      const wFt = Math.round((maxX - minX) / 30.48);
      const dFt = Math.round((maxY - minY) / 30.48);
      if (wFt > 0 && dFt > 0) {
        expDimStr = `${wFt}' X ${dFt}'`;
      } else {
        expDimStr = `${room.areaSquareMeters || 12.5} m²`;
      }
    }

    const isSmallRoom = (room.areaSquareMeters || 12.5) < 7 || expPrimary.includes('TOILET') || expPrimary.includes('BATH') || expPrimary.includes('WASH');

    // Measure room labels for crisp architectural white wipeout plate (100% legibility on any floor)
    ectx.font = 'bold 15px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const expNameMetrics = ectx.measureText(expPrimary);
    ectx.font = '600 12px "Inter", monospace, sans-serif';
    const expDimMetrics = ectx.measureText(expDimStr);
    let expMaxW = Math.max(expNameMetrics.width, expDimMetrics.width);
    const expLvl = activeFloor > 0 ? `+${activeFloor * 10}'0" LVL.` : `±2'0" LVL.`;
    if (!isSmallRoom) {
      ectx.font = 'bold 10px monospace';
      const expLvlMetrics = ectx.measureText(expLvl);
      expMaxW = Math.max(expMaxW, expLvlMetrics.width);
    }

    const expPlateW = Math.max(expMaxW + 18, 64);
    const expPlateH = isSmallRoom ? 38 : 56;
    const expPlateX = roomCenter.x - expPlateW / 2;
    const expPlateY = isSmallRoom ? roomCenter.y - 19 : roomCenter.y - 28;

    ectx.save();
    ectx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ectx.strokeStyle = 'rgba(203, 213, 225, 0.85)';
    ectx.lineWidth = 1.2;
    ectx.beginPath();
    ectx.roundRect(expPlateX, expPlateY, expPlateW, expPlateH, 5);
    ectx.fill();
    ectx.stroke();
    ectx.restore();

    ectx.save();
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.lineJoin = 'round';
    ectx.miterLimit = 2;

    // 1. Room Name (Compact architectural typography)
    ectx.font = 'bold 15px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const nameY = isSmallRoom ? roomCenter.y - 7 : roomCenter.y - 9;
    ectx.fillStyle = '#0f172a';
    ectx.fillText(expPrimary, roomCenter.x, nameY);

    // 2. Dimension Text
    ectx.font = '600 12px "Inter", monospace, sans-serif';
    const dimY = isSmallRoom ? roomCenter.y + 7 : roomCenter.y + 6;
    ectx.fillStyle = '#334155';
    ectx.fillText(expDimStr, roomCenter.x, dimY);

    // 3. Level Text (only shown on larger rooms, matching Image 2)
    if (!isSmallRoom) {
      ectx.font = 'bold 10px monospace';
      ectx.fillStyle = '#e11d48';
      ectx.fillText(expLvl, roomCenter.x, roomCenter.y + 19);
    }

    ectx.restore();
  });

  // Draw Walls (Solid Dark Charcoal CAD Core with Continuous Closed Corners)
  if (expWalls.length > 0) {
    const expMesh = buildCADWallMesh(expWalls, (x, y) => toHDScreen(x, y), hdScale);

    // 1. Solid Core Wall Fills
    expMesh.wallVertexData.forEach((w) => {
      ectx.save();
      ectx.fillStyle = '#111827';
      ectx.beginPath();
      ectx.moveTo(w.startLeft.x, w.startLeft.y);
      ectx.lineTo(w.endRight.x, w.endRight.y);
      ectx.lineTo(w.endLeft.x, w.endLeft.y);
      ectx.lineTo(w.startRight.x, w.startRight.y);
      ectx.closePath();
      ectx.fill();
      ectx.restore();
    });

    // 2. Junction Core Fills (Seamless monolithic joints - zero corner notches)
    expMesh.junctionFills.forEach((jf) => {
      if (jf.corners.length < 2) return;
      ectx.save();
      ectx.fillStyle = jf.color || '#111827';
      ectx.beginPath();
      jf.corners.forEach((pt, pIdx) => {
        if (pIdx === 0) ectx.moveTo(pt.x, pt.y);
        else ectx.lineTo(pt.x, pt.y);
      });
      ectx.closePath();
      ectx.fill();
      ectx.restore();
    });

    // 3. Crisp CAD Outer and Inner Perimeter Borders (Closed Corners)
    expMesh.wallVertexData.forEach((w) => {
      ectx.save();
      ectx.strokeStyle = '#000000';
      ectx.lineWidth = 2.8;
      ectx.lineJoin = 'miter';
      ectx.miterLimit = 3;

      ectx.beginPath();
      ectx.moveTo(w.startLeft.x, w.startLeft.y);
      ectx.lineTo(w.endRight.x, w.endRight.y);

      ectx.moveTo(w.startRight.x, w.startRight.y);
      ectx.lineTo(w.endLeft.x, w.endLeft.y);

      if (!w.hasStartJoin) {
        ectx.moveTo(w.startLeft.x, w.startLeft.y);
        ectx.lineTo(w.startRight.x, w.startRight.y);
      }
      if (!w.hasEndJoin) {
        ectx.moveTo(w.endLeft.x, w.endLeft.y);
        ectx.lineTo(w.endRight.x, w.endRight.y);
      }
      ectx.stroke();
      ectx.restore();
    });
  }

  // Draw Furniture (Architectural Blocks - Image 2 Parity)
  expFurniture.forEach((item) => {
    const sp = toHDScreen(item.x, item.y);
    const w = item.width * hdScale;
    const d = item.depth * hdScale;
    const lowerName = (item.name || '').toLowerCase();
    const lowerCat = (item.category || '').toLowerCase();

    ectx.save();
    ectx.translate(sp.x, sp.y);
    ectx.rotate(item.angle || 0);

    const isDoor = item.catalogId === 'door' || lowerCat === 'doors & windows' || lowerName.includes('door');
    const isWindow = item.catalogId === 'window' || lowerName.includes('window');
    const isStairs = lowerCat === 'stairs' || lowerName.includes('stair');

    if (isDoor) {
      ectx.fillStyle = '#ffffff';
      ectx.fillRect(-w / 2, -d / 2, w, d);
      ectx.strokeStyle = '#000000';
      ectx.lineWidth = 2.5;
      ectx.strokeRect(-w / 2, -d / 2, w, d);

      // 90 deg swing arc
      ectx.strokeStyle = '#0284c7';
      ectx.lineWidth = 2;
      ectx.setLineDash([6, 4]);
      ectx.beginPath();
      ectx.arc(-w / 2, d / 2, w, 0, -Math.PI / 2, true);
      ectx.stroke();
      ectx.setLineDash([]);

      // Door Leaf
      ectx.strokeStyle = '#0f172a';
      ectx.lineWidth = 3.5;
      ectx.beginPath();
      ectx.moveTo(-w / 2, d / 2);
      ectx.lineTo(-w / 2, d / 2 - w);
      ectx.stroke();
    } else if (isWindow) {
      ectx.fillStyle = '#ffffff';
      ectx.fillRect(-w / 2, -d / 2, w, d);
      ectx.strokeStyle = '#000000';
      ectx.lineWidth = 2.5;
      ectx.strokeRect(-w / 2, -d / 2, w, d);
      // Glass Line
      ectx.strokeStyle = '#0284c7';
      ectx.lineWidth = 2;
      ectx.beginPath();
      ectx.moveTo(-w / 2 + 2, 0);
      ectx.lineTo(w / 2 - 2, 0);
      ectx.stroke();
    } else if (isStairs) {
      // Stairs: Treads & UP Arrow
      ectx.fillStyle = '#ffffff';
      ectx.strokeStyle = '#334155';
      ectx.lineWidth = 2;
      ectx.fillRect(-w / 2, -d / 2, w, d);
      ectx.strokeRect(-w / 2, -d / 2, w, d);

      const numTreads = 12;
      const step = d / numTreads;
      ectx.strokeStyle = '#64748b';
      ectx.lineWidth = 1.2;
      for (let t = 1; t < numTreads; t++) {
        const ty = -d / 2 + t * step;
        ectx.beginPath();
        ectx.moveTo(-w / 2, ty);
        ectx.lineTo(w / 2, ty);
        ectx.stroke();
      }
      ectx.strokeStyle = '#0284c7';
      ectx.lineWidth = 2.5;
      ectx.beginPath();
      ectx.moveTo(0, d / 2 - 16);
      ectx.lineTo(0, -d / 2 + 20);
      ectx.lineTo(-8, -d / 2 + 30);
      ectx.moveTo(0, -d / 2 + 20);
      ectx.lineTo(8, -d / 2 + 30);
      ectx.stroke();
      ectx.fillStyle = '#0284c7';
      ectx.font = 'bold 12px system-ui';
      ectx.textAlign = 'center';
      ectx.fillText('UP', 0, d / 2 - 24);
    } else if (lowerCat === 'bedroom' || lowerName.includes('bed')) {
      // Bed Symbol: white mattress, dark headboard, sage green pillows, side nightstands (Image 2)
      ectx.fillStyle = '#ffffff';
      ectx.strokeStyle = '#334155';
      ectx.lineWidth = 2.5;
      ectx.beginPath();
      ectx.roundRect(-w / 2, -d / 2, w, d, 6);
      ectx.fill();
      ectx.stroke();

      // Headboard
      const hbThick = Math.max(4, d * 0.15);
      ectx.fillStyle = '#1e293b';
      ectx.fillRect(-w / 2, -d / 2, w, hbThick);

      // Nightstands
      const nsW = Math.max(6, w * 0.2);
      const nsD = Math.max(6, d * 0.22);
      ectx.fillStyle = '#ffffff';
      ectx.strokeStyle = '#64748b';
      ectx.lineWidth = 1.5;
      ectx.fillRect(-w / 2 - nsW, -d / 2, nsW, nsD);
      ectx.strokeRect(-w / 2 - nsW, -d / 2, nsW, nsD);
      ectx.fillRect(w / 2, -d / 2, nsW, nsD);
      ectx.strokeRect(w / 2, -d / 2, nsW, nsD);

      // Sage green pillows (Image 2)
      const pW = (w - 14) / 2;
      const pH = Math.max(8, d * 0.22);
      const pY = -d / 2 + hbThick + 4;
      ectx.fillStyle = '#84cc16';
      ectx.strokeStyle = '#4d7c0f';
      ectx.lineWidth = 1.5;
      ectx.beginPath();
      ectx.roundRect(-w / 2 + 5, pY, pW, pH, 3);
      ectx.roundRect(w / 2 - pW - 5, pY, pW, pH, 3);
      ectx.fill();
      ectx.stroke();
    } else if (lowerName.includes('wardrobe') || lowerName.includes('closet') || lowerCat === 'storage') {
      // Wardrobe Symbol with "WARDROBE" text (Image 2)
      ectx.fillStyle = '#ffffff';
      ectx.strokeStyle = '#334155';
      ectx.lineWidth = 2.5;
      ectx.beginPath();
      ectx.rect(-w / 2, -d / 2, w, d);
      ectx.fill();
      ectx.stroke();
      ectx.strokeStyle = '#94a3b8';
      ectx.lineWidth = 1.5;
      ectx.beginPath();
      ectx.moveTo(0, -d / 2);
      ectx.lineTo(0, d / 2);
      ectx.stroke();
      ectx.fillStyle = '#475569';
      ectx.font = 'bold 12px system-ui, sans-serif';
      ectx.textAlign = 'center';
      ectx.textBaseline = 'middle';
      ectx.fillText('WARDROBE', 0, 0);
    } else {
      // General Architectural Furniture
      const primaryColor = item.partColors?.top || item.partColors?.seat || item.partColors?.body || item.color || '#ffffff';
      ectx.fillStyle = primaryColor;
      ectx.strokeStyle = '#334155';
      ectx.lineWidth = 2.5;
      ectx.beginPath();
      ectx.roundRect(-w / 2, -d / 2, w, d, 6);
      ectx.fill();
      ectx.stroke();
    }
    ectx.restore();
  });

  // Floor Title Under Floor Plan (Image 2: e.g. "GROUND FLOOR PLAN" with underline)
  const floorPlanTitle = `${floorDisplayName.toUpperCase()} PLAN`;
  const titleY = Math.min(height - 180, sheetCenterY + (planH / 2) * hdScale + 60);
  ectx.save();
  ectx.font = 'bold 26px "Inter", system-ui, sans-serif';
  ectx.fillStyle = '#0f172a';
  ectx.textAlign = 'center';
  ectx.fillText(floorPlanTitle, sheetCenterX, titleY);
  const titleWidth = ectx.measureText(floorPlanTitle).width;
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 3;
  ectx.beginPath();
  ectx.moveTo(sheetCenterX - titleWidth / 2 - 16, titleY + 14);
  ectx.lineTo(sheetCenterX + titleWidth / 2 + 16, titleY + 14);
  ectx.stroke();
  ectx.restore();

  // 1. Architectural North Arrow Compass
  ectx.save();
  const compassX = width - 810;
  const compassY = height - 170;
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 2.5;
  ectx.fillStyle = '#0f172a';

  // Compass circle
  ectx.beginPath();
  ectx.arc(compassX, compassY, 26, 0, Math.PI * 2);
  ectx.stroke();

  // North needle (filled left half, stroked right half)
  ectx.beginPath();
  ectx.moveTo(compassX, compassY - 22);
  ectx.lineTo(compassX - 6, compassY + 8);
  ectx.lineTo(compassX, compassY + 2);
  ectx.closePath();
  ectx.fill();

  ectx.beginPath();
  ectx.moveTo(compassX, compassY - 22);
  ectx.lineTo(compassX + 6, compassY + 8);
  ectx.lineTo(compassX, compassY + 2);
  ectx.closePath();
  ectx.stroke();

  // 'N' label
  ectx.font = '900 13px system-ui, sans-serif';
  ectx.textAlign = 'center';
  ectx.textBaseline = 'bottom';
  ectx.fillText('N', compassX, compassY - 24);
  ectx.restore();

  // 2. Title Block (DecoFrog 3D Certified Architectural Title Block)
  ectx.save();
  ectx.fillStyle = '#ffffff';
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 3;
  ectx.fillRect(width - 760, height - 260, 680, 180);
  ectx.strokeRect(width - 760, height - 260, 680, 180);

  // Brand Header Strip
  ectx.fillStyle = '#0284c7';
  ectx.fillRect(width - 760, height - 260, 680, 8);

  // Project Title
  ectx.fillStyle = '#0f172a';
  ectx.font = '900 24px system-ui, sans-serif';
  ectx.textAlign = 'left';
  ectx.fillText(plan.name || 'DecoFrog 3D Architectural Blueprint', width - 730, height - 215);

  // Floor Level & Scale
  ectx.font = 'bold 15px monospace';
  ectx.fillStyle = '#0284c7';
  ectx.fillText(`LEVEL: ${floorDisplayName.toUpperCase()} • SCALE 1:50`, width - 730, height - 180);

  // Graphic Metric Scale Bar (0m to 4m)
  const barX = width - 730;
  const barY = height - 150;
  const barUnitPx = 40; // 40px = 1 meter on sheet
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 2;
  ectx.strokeRect(barX, barY, barUnitPx * 4, 8);
  ectx.fillStyle = '#0f172a';
  ectx.fillRect(barX, barY, barUnitPx, 8);
  ectx.fillRect(barX + barUnitPx * 2, barY, barUnitPx, 8);
  ectx.font = 'bold 10px monospace';
  ectx.fillText('0m', barX - 4, barY + 20);
  ectx.fillText('2m', barX + barUnitPx * 2 - 6, barY + 20);
  ectx.fillText('4m', barX + barUnitPx * 4 - 6, barY + 20);

  // Date and Metadata
  ectx.font = '12px system-ui, sans-serif';
  ectx.fillStyle = '#64748b';
  ectx.fillText(`DATE: ${new Date().toLocaleDateString()} • CERTIFIED DECOFROG 3D CAD BLUEPRINT`, width - 530, barY + 16);
  ectx.restore();

  const dataUrl = exportCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  const safeName = (plan.name || 'Floorplan').replace(/\s+/g, '_');
  link.download = `${safeName}_${floorDisplayName.replace(/\s+/g, '_')}_4K_Blueprint.png`;
  link.click();
}

export function printPlanSheet(plan: HomePlan, activeFloor: number = 0) {
  exportPlan4kPng(plan, activeFloor);
  setTimeout(() => {
    window.print();
  }, 500);
}
