import React, { useRef, useEffect, useState } from 'react';

export function PlanCanvas2D({
  homeState,
  setHomeState,
  selectedObject,
  setSelectedObject,
  currentMode
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentMouse, setCurrentMouse] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const pan = { x: 30, y: 30 };
  const zoom = 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    const gridSize = 50;
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 0.5;
    for (let x = -500; x < 2000; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -500);
      ctx.lineTo(x, 2000);
      ctx.stroke();
    }
    for (let y = -500; y < 2000; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-500, y);
      ctx.lineTo(2000, y);
      ctx.stroke();
    }

    // Draw Rooms
    (homeState.rooms || []).forEach(room => {
      if (room.points && room.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(room.points[0].x, room.points[0].y);
        for (let i = 1; i < room.points.length; i++) {
          ctx.lineTo(room.points[i].x, room.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = room.color || 'rgba(241, 245, 249, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw Walls
    (homeState.walls || []).forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.strokeStyle = selectedObject === wall ? '#38bdf8' : '#e2e8f0';
      ctx.lineWidth = wall.thickness || 15;
      ctx.lineCap = 'square';
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw Furniture
    (homeState.furniture || []).forEach(item => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(((item.angle || 0) * Math.PI) / 180);

      const w = item.width;
      const d = item.depth;

      if (selectedObject === item) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w / 2 - 4, -d / 2 - 4, w + 8, d + 8);
      }

      ctx.fillStyle = item.color || '#475569';
      ctx.fillRect(-w / 2, -d / 2, w, d);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -d / 2, w, d);

      // Orientation triangle
      ctx.beginPath();
      ctx.moveTo(-w / 2, -d / 2);
      ctx.lineTo(0, -d / 2 - 6);
      ctx.lineTo(w / 2, -d / 2);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, 0, 0);

      ctx.restore();
    });

    // Wall drawing preview
    if (isDrawing && currentMode === 'wall') {
      ctx.beginPath();
      ctx.moveTo(drawStart.x, drawStart.y);
      ctx.lineTo(currentMouse.x, currentMouse.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 15;
      ctx.stroke();
    }

    ctx.restore();
  }, [homeState, selectedObject, isDrawing, drawStart, currentMouse, currentMode]);

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    return {
      x: (rawX - pan.x) / zoom,
      y: (rawY - pan.y) / zoom
    };
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const coords = getCanvasCoords(e);

    if (currentMode === 'select') {
      let hit = null;
      for (let i = homeState.furniture.length - 1; i >= 0; i--) {
        const f = homeState.furniture[i];
        if (Math.abs(coords.x - f.x) <= f.width / 2 && Math.abs(coords.y - f.y) <= f.depth / 2) {
          hit = f;
          break;
        }
      }
      setSelectedObject(hit);
      if (hit) {
        setIsDragging(true);
        setDragOffset({ x: coords.x - hit.x, y: coords.y - hit.y });
      }
    } else if (currentMode === 'wall') {
      setIsDrawing(true);
      const snapX = Math.round(coords.x / 10) * 10;
      const snapY = Math.round(coords.y / 10) * 10;
      setDrawStart({ x: snapX, y: snapY });
      setCurrentMouse({ x: snapX, y: snapY });
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    setCurrentMouse(coords);

    if (isDragging && selectedObject) {
      const newX = Math.round((coords.x - dragOffset.x) / 5) * 5;
      const newY = Math.round((coords.y - dragOffset.y) / 5) * 5;
      setHomeState(prev => ({
        ...prev,
        furniture: prev.furniture.map(f => f === selectedObject ? { ...f, x: newX, y: newY } : f)
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentMode === 'wall') {
      const x2 = Math.round(currentMouse.x / 10) * 10;
      const y2 = Math.round(currentMouse.y / 10) * 10;
      if (Math.hypot(x2 - drawStart.x, y2 - drawStart.y) > 20) {
        setHomeState(prev => ({
          ...prev,
          walls: [...prev.walls, { x1: drawStart.x, y1: drawStart.y, x2, y2, thickness: 15, height: 250 }]
        }));
      }
      setIsDrawing(false);
    }
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const catItem = JSON.parse(data);
    const coords = getCanvasCoords(e);

    const newPiece = {
      id: 'f_' + Date.now(),
      type: catItem.id,
      name: catItem.name,
      x: Math.round(coords.x),
      y: Math.round(coords.y),
      width: catItem.width,
      depth: catItem.depth,
      height: catItem.height,
      elevation: 0,
      angle: 0,
      color: catItem.color
    };

    setHomeState(prev => ({
      ...prev,
      furniture: [...prev.furniture, newPiece]
    }));
    setSelectedObject(newPiece);
  };

  return (
    <div
      style={{ flex: 1, height: '100%', position: 'relative', background: '#121214', borderRight: '1px solid #27272a' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(24, 24, 27, 0.85)',
        border: '1px solid #3f3f46',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#38bdf8',
        pointerEvents: 'none',
        zIndex: 5
      }}>
        2D Plan CAD View
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%', display: 'block', cursor: currentMode === 'wall' ? 'crosshair' : 'default' }}
      />
    </div>
  );
}
