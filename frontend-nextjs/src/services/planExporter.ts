import { HomePlan } from '../types/plan';

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

  // Rooms
  flRooms.forEach((r) => {
    if (r.points.length < 3) return;
    const pts = r.points.map((p) => p.x + ',' + p.y).join(' ');
    svg += '  <polygon points="' + pts + '" fill="rgba(240, 249, 255, 0.7)" stroke="#0284c7" stroke-width="1.5" />\n';
  });

  // Walls
  flWalls.forEach((w) => {
    svg += '  <line x1="' + w.xStart + '" y1="' + w.yStart + '" x2="' + w.xEnd + '" y2="' + w.yEnd + '" stroke="#1e293b" stroke-width="' + (w.thickness || 15) + '" stroke-linecap="square" />\n';
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

  // Draw Rooms
  expRooms.forEach((room) => {
    if (room.points.length < 3) return;
    ectx.fillStyle = room.floorColor || 'rgba(240, 249, 255, 0.7)';
    ectx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
    ectx.lineWidth = 3;
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

    const avgX = room.points.reduce((acc, p) => acc + p.x, 0) / room.points.length;
    const avgY = room.points.reduce((acc, p) => acc + p.y, 0) / room.points.length;
    const roomCenter = toHDScreen(avgX, avgY);

    ectx.save();
    ectx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ectx.strokeStyle = '#cbd5e1';
    ectx.lineWidth = 2;
    ectx.beginPath();
    ectx.roundRect(roomCenter.x - 140, roomCenter.y - 36, 280, 72, 12);
    ectx.fill();
    ectx.stroke();

    ectx.fillStyle = '#0f172a';
    ectx.font = 'bold 22px system-ui, sans-serif';
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.fillText(room.name.toUpperCase(), roomCenter.x, roomCenter.y - 12);

    ectx.fillStyle = '#0284c7';
    ectx.font = 'bold 20px monospace';
    ectx.fillText(`${room.areaSquareMeters || 12.5} m²`, roomCenter.x, roomCenter.y + 16);
    ectx.restore();
  });

  // Draw Walls
  expWalls.forEach((wall) => {
    const p1 = toHDScreen(wall.xStart, wall.yStart);
    const p2 = toHDScreen(wall.xEnd, wall.yEnd);
    const thPx = Math.max(8, (wall.thickness || 15) * hdScale);
    ectx.save();
    ectx.strokeStyle = wall.color || '#1e293b';
    ectx.lineWidth = thPx;
    ectx.lineCap = 'square';
    ectx.beginPath();
    ectx.moveTo(p1.x, p1.y);
    ectx.lineTo(p2.x, p2.y);
    ectx.stroke();
    ectx.restore();
  });

  // Draw Furniture
  expFurniture.forEach((item) => {
    const sp = toHDScreen(item.x, item.y);
    const w = item.width * hdScale;
    const d = item.depth * hdScale;
    ectx.save();
    ectx.translate(sp.x, sp.y);
    ectx.rotate(item.angle || 0);
    ectx.fillStyle = item.color || '#f8fafc';
    ectx.strokeStyle = '#334155';
    ectx.lineWidth = 2.5;
    ectx.beginPath();
    ectx.roundRect(-w / 2, -d / 2, w, d, 6);
    ectx.fill();
    ectx.stroke();

    ectx.fillStyle = '#0f172a';
    ectx.font = 'bold 15px system-ui, sans-serif';
    ectx.textAlign = 'center';
    ectx.textBaseline = 'middle';
    ectx.fillText(item.name, 0, 0);
    ectx.restore();
  });

  // Title Block
  ectx.save();
  ectx.fillStyle = '#ffffff';
  ectx.strokeStyle = '#0f172a';
  ectx.lineWidth = 3;
  ectx.fillRect(width - 760, height - 260, 660, 160);
  ectx.strokeRect(width - 760, height - 260, 660, 160);

  ectx.fillStyle = '#0f172a';
  ectx.font = '900 28px system-ui, sans-serif';
  ectx.textAlign = 'left';
  ectx.fillText(plan.name || 'DecoForge 3D Architectural Blueprint', width - 730, height - 210);

  ectx.font = 'bold 18px monospace';
  ectx.fillStyle = '#4f46e5';
  ectx.fillText(`LEVEL: ${floorDisplayName.toUpperCase()} • SCALE 1:50`, width - 730, height - 170);

  ectx.font = '14px system-ui, sans-serif';
  ectx.fillStyle = '#64748b';
  ectx.fillText(`DATE: ${new Date().toLocaleDateString()} • ULTRA HD 4K EXPORT`, width - 730, height - 130);
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
