/**
 * CAD Wall Mesh Service
 * Generates continuous, gapless, closed-corner wall meshes for 2D architectural blueprint drafting.
 * Solves L-corners, T-junctions, and multi-wall intersections with exact mitered geometry.
 */

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface WallInput {
  id?: string;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  thickness?: number;
  color?: string;
  floorLevel?: number;
}

export interface WallVertexData {
  startLeft: ScreenPoint;
  startRight: ScreenPoint;
  endLeft: ScreenPoint;
  endRight: ScreenPoint;
  hasStartJoin: boolean;
  hasEndJoin: boolean;
  len: number;
  thPx: number;
  p1: ScreenPoint;
  p2: ScreenPoint;
  dir: ScreenPoint;
  angle: number;
  color?: string;
  id?: string;
}

export interface JunctionFill {
  center: ScreenPoint;
  corners: ScreenPoint[];
  color?: string;
}

export interface CADWallMesh {
  wallVertexData: WallVertexData[];
  junctionFills: JunctionFill[];
}

/**
 * Calculates perpendicular distance from point p to segment [a, b].
 */
function distToSegment(p: ScreenPoint, a: ScreenPoint, b: ScreenPoint) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return { dist: Math.hypot(p.x - a.x, p.y - a.y), proj: a, u: 0 };
  const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  const proj = { x: a.x + u * dx, y: a.y + u * dy };
  return { dist: Math.hypot(p.x - proj.x, p.y - proj.y), proj, u };
}

/**
 * Builds continuous CAD wall geometry with closed mitered corners and seamless junctions.
 */
export function buildCADWallMesh(
  walls: WallInput[],
  toScreen: (x: number, y: number) => ScreenPoint,
  scale: number
): CADWallMesh {
  const screenWalls = walls.map((w) => {
    const p1 = toScreen(w.xStart, w.yStart);
    const p2 = toScreen(w.xEnd, w.yEnd);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const thPx = Math.max(5, (w.thickness || 15) * scale);
    const dir = len > 0 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 };
    return {
      p1,
      p2,
      len,
      dir,
      angle: Math.atan2(dy, dx),
      thPx,
      color: w.color,
      id: w.id,
    };
  });

  const wallVertexData: WallVertexData[] = screenWalls.map((sw) => {
    const nx = -sw.dir.y * (sw.thPx / 2);
    const ny = sw.dir.x * (sw.thPx / 2);
    return {
      startLeft: { x: sw.p1.x + nx, y: sw.p1.y + ny },
      startRight: { x: sw.p1.x - nx, y: sw.p1.y - ny },
      endLeft: { x: sw.p2.x - nx, y: sw.p2.y - ny },
      endRight: { x: sw.p2.x + nx, y: sw.p2.y + ny },
      hasStartJoin: false,
      hasEndJoin: false,
      len: sw.len,
      thPx: sw.thPx,
      p1: sw.p1,
      p2: sw.p2,
      dir: sw.dir,
      angle: sw.angle,
      color: sw.color,
      id: sw.id,
    };
  });

  interface Endpoint {
    wallIdx: number;
    isStart: boolean;
    x: number;
    y: number;
    dir: ScreenPoint;
    thPx: number;
    angle?: number;
    color?: string;
  }

  const endpoints: Endpoint[] = [];
  screenWalls.forEach((sw, wIdx) => {
    if (sw.len < 1) return;
    endpoints.push({
      wallIdx: wIdx,
      isStart: true,
      x: sw.p1.x,
      y: sw.p1.y,
      dir: sw.dir,
      thPx: sw.thPx,
      color: sw.color,
    });
    endpoints.push({
      wallIdx: wIdx,
      isStart: false,
      x: sw.p2.x,
      y: sw.p2.y,
      dir: { x: -sw.dir.x, y: -sw.dir.y },
      thPx: sw.thPx,
      color: sw.color,
    });
  });

  interface JunctionCluster {
    x: number;
    y: number;
    thPx: number;
    connections: Endpoint[];
  }

  const junctions: JunctionCluster[] = [];
  endpoints.forEach((ep) => {
    let j = junctions.find((jn) => Math.hypot(jn.x - ep.x, jn.y - ep.y) <= Math.max(jn.thPx, ep.thPx, 18));
    if (!j) {
      j = { x: ep.x, y: ep.y, thPx: ep.thPx, connections: [] };
      junctions.push(j);
    }
    j.connections.push(ep);
    j.thPx = Math.max(j.thPx, ep.thPx);
  });

  const junctionFills: JunctionFill[] = [];

  // Solve multi-wall junctions (L-corners, 3-way T-junctions, 4-way cross junctions)
  junctions.forEach((j) => {
    const conns = j.connections;
    if (conns.length < 2) return;

    conns.forEach((c) => {
      c.angle = Math.atan2(c.dir.y, c.dir.x);
    });
    conns.sort((a, b) => (a.angle ?? 0) - (b.angle ?? 0));

    const corners: ScreenPoint[] = [];
    for (let i = 0; i < conns.length; i++) {
      const cA = conns[i];
      const cB = conns[(i + 1) % conns.length];

      const nA = { x: -cA.dir.y, y: cA.dir.x };
      const nB = { x: cB.dir.y, y: -cB.dir.x };

      const pA = { x: j.x + nA.x * (cA.thPx / 2), y: j.y + nA.y * (cA.thPx / 2) };
      const pB = { x: j.x + nB.x * (cB.thPx / 2), y: j.y + nB.y * (cB.thPx / 2) };

      const cross = cA.dir.x * cB.dir.y - cA.dir.y * cB.dir.x;
      let cornerPt: ScreenPoint;
      if (Math.abs(cross) < 1e-4) {
        cornerPt = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
      } else {
        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const t = (dx * cB.dir.y - dy * cB.dir.x) / cross;
        const maxT = 2.5 * Math.max(cA.thPx, cB.thPx);
        const clampedT = Math.max(-maxT, Math.min(maxT, t));
        cornerPt = { x: pA.x + clampedT * cA.dir.x, y: pA.y + clampedT * cA.dir.y };
      }
      corners.push(cornerPt);

      // cA left side (facing CCW towards cB)
      const wpA = wallVertexData[cA.wallIdx];
      if (cA.isStart) {
        wpA.startLeft = cornerPt;
        wpA.hasStartJoin = true;
      } else {
        wpA.endLeft = cornerPt;
        wpA.hasEndJoin = true;
      }

      // cB right side (facing CW towards cA)
      const wpB = wallVertexData[cB.wallIdx];
      if (cB.isStart) {
        wpB.startRight = cornerPt;
        wpB.hasStartJoin = true;
      } else {
        wpB.endRight = cornerPt;
        wpB.hasEndJoin = true;
      }
    }

    const jColor = conns.find((c) => c.color)?.color;
    junctionFills.push({ center: { x: j.x, y: j.y }, corners, color: jColor });
  });

  // T-junction body touches for remaining free endpoints attaching along the span of another wall
  screenWalls.forEach((sw, wIdx) => {
    const wp = wallVertexData[wIdx];
    [true, false].forEach((isStart) => {
      const isJoined = isStart ? wp.hasStartJoin : wp.hasEndJoin;
      if (isJoined) return;
      const pt = isStart ? sw.p1 : sw.p2;
      const th = sw.thPx;

      for (let oIdx = 0; oIdx < screenWalls.length; oIdx++) {
        if (oIdx === wIdx) continue;
        const oSw = screenWalls[oIdx];
        const res = distToSegment(pt, oSw.p1, oSw.p2);
        if (res.dist <= Math.max(th, oSw.thPx) * 1.2 && res.u > 0.02 && res.u < 0.98) {
          if (isStart) wp.hasStartJoin = true;
          else wp.hasEndJoin = true;
          break;
        }
      }
    });
  });

  return { wallVertexData, junctionFills };
}
