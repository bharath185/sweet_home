import React, { useState } from 'react';
import { Viewport3D } from './Viewport3D';
import { Edit3, Eye, Sparkles, Map, Camera, Share2, Sun, Moon, Compass, Maximize, Check } from 'lucide-react';

export function CustomerPresentationView({ homeState, onSwitchToEditor, onOpenShare }) {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#09090b',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Floating Bar for Customer */}
      <header style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        right: '20px',
        height: '54px',
        background: 'rgba(24, 24, 27, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(63, 63, 70, 0.7)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        zIndex: 30,
        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand & Project Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Interactive 3D Customer Presentation
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
              Full WebGL View Control • {homeState.rooms.length || 1} Rooms • {homeState.furniture.length} Pieces
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            style={{
              background: showMiniMap ? '#2563eb' : '#27272a',
              color: 'white',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Map size={14} /> {showMiniMap ? 'Hide 2D Map' : 'Show 2D Map'}
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: '#27272a',
              color: '#e4e4e7',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Maximize size={14} /> Fullscreen
          </button>

          <button
            onClick={onOpenShare}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Share2 size={14} /> Share Link
          </button>

          <button
            onClick={onSwitchToEditor}
            style={{
              background: '#27272a',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Edit3 size={14} /> Designer Studio
          </button>
        </div>
      </header>

      {/* Main Full-Screen WebGL 3D Viewport with Full Controls */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Viewport3D homeState={homeState} />

        {/* Floating Mini 2D Floor Plan Overview */}
        {showMiniMap && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '260px',
            height: '200px',
            background: 'rgba(24, 24, 27, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(63, 63, 70, 0.8)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.6)',
            zIndex: 20
          }}>
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Floor Plan CAD Map
              </span>
              <span style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>Interactive</span>
            </div>
            <svg
              viewBox="0 0 650 500"
              style={{ width: '100%', height: 'calc(100% - 32px)', padding: '8px' }}
            >
              {/* Rooms */}
              {(homeState.rooms || []).map((r, i) => (
                <polygon
                  key={i}
                  points={(r.points || []).map(p => `${p.x},${p.y}`).join(' ')}
                  fill={r.color || '#334155'}
                  opacity={0.5}
                />
              ))}
              {/* Walls */}
              {(homeState.walls || []).map((w, i) => (
                <line
                  key={i}
                  x1={w.x1}
                  y1={w.y1}
                  x2={w.x2}
                  y2={w.y2}
                  stroke="#f1f5f9"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              ))}
              {/* Furniture */}
              {(homeState.furniture || []).map((f, i) => (
                <rect
                  key={i}
                  x={f.x - f.width / 2}
                  y={f.y - f.depth / 2}
                  width={f.width}
                  height={f.depth}
                  fill={f.color || '#3b82f6'}
                  transform={`rotate(${f.angle || 0} ${f.x} ${f.y})`}
                  rx="3"
                />
              ))}
            </svg>
          </div>
        )}

        {/* Customer Controls Helper */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          background: 'rgba(24, 24, 27, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(63, 63, 70, 0.6)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.8rem',
          color: '#e4e4e7',
          lineHeight: 1.6,
          zIndex: 20,
          boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>Customer 3D View Controls</div>
          <div><strong>Rotate 3D:</strong> Left Click + Drag anywhere</div>
          <div><strong>Zoom & Pan:</strong> Mouse Wheel / Right Click + Drag</div>
          <div><strong>Lighting:</strong> Click Morning / Noon / Sunset / Night buttons above</div>
        </div>
      </div>
    </div>
  );
}
