import React from 'react';
import { Home, MousePointer, Square, Trash2, Download, Upload, Eye, Share2, Sparkles } from 'lucide-react';

export function Navbar({
  currentMode,
  setMode,
  onDelete,
  onClear,
  onExport,
  onImport,
  onSample,
  onOpenShare,
  onOpenCustomerView
}) {
  return (
    <header style={{
      height: '52px',
      background: '#18181b',
      borderBottom: '1px solid #27272a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      userSelect: 'none',
      zIndex: 20
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem', color: '#fafafa' }}>
        <Home color="#3b82f6" size={22} />
        <span>Sweet Home 3D</span>
        <span style={{
          background: '#3b82f6',
          color: 'white',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '999px',
          textTransform: 'uppercase'
        }}>
          Web Studio
        </span>
      </div>

      {/* CAD Drawing Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setMode('select')}
          style={{
            background: currentMode === 'select' ? '#3b82f6' : '#27272a',
            color: 'white',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <MousePointer size={15} /> Select
        </button>

        <button
          onClick={() => setMode('wall')}
          style={{
            background: currentMode === 'wall' ? '#3b82f6' : '#27272a',
            color: 'white',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Square size={15} /> Draw Wall
        </button>

        <button
          onClick={onDelete}
          style={{
            background: '#27272a',
            color: '#f87171',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Trash2 size={15} /> Delete
        </button>

        <button
          onClick={onClear}
          style={{
            background: '#27272a',
            color: '#a1a1aa',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      {/* Sharing & Presentation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onSample}
          style={{
            background: '#27272a',
            color: '#e4e4e7',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Sample
        </button>

        <button
          onClick={onOpenCustomerView}
          style={{
            background: '#27272a',
            color: '#e4e4e7',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Eye size={15} color="#38bdf8" /> Customer Tour
        </button>

        <button
          onClick={onOpenShare}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Share2 size={15} /> Share with Customer
        </button>

        <button
          onClick={onExport}
          style={{
            background: '#27272a',
            color: '#e4e4e7',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Export JSON / SH3D"
        >
          <Download size={14} /> Export
        </button>
      </div>
    </header>
  );
}
