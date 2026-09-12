import React from 'react';

export function InspectorSidebar({ selectedObject, onUpdateProp }) {
  return (
    <aside style={{
      width: '240px',
      background: '#18181b',
      borderLeft: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      padding: '14px',
      gap: '12px',
      userSelect: 'none'
    }}>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#a1a1aa',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #27272a',
        paddingBottom: '6px'
      }}>
        Properties
      </div>

      {!selectedObject ? (
        <div style={{ color: '#71717a', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
          Select any object in 2D or 3D to edit its dimensions and materials.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{selectedObject.name || 'Wall'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Width (cm)</span>
            <input
              type="number"
              value={selectedObject.width || 0}
              onChange={(e) => onUpdateProp('width', parseFloat(e.target.value) || 0)}
              style={{ width: '70px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '3px 6px', color: 'white', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Depth (cm)</span>
            <input
              type="number"
              value={selectedObject.depth || 0}
              onChange={(e) => onUpdateProp('depth', parseFloat(e.target.value) || 0)}
              style={{ width: '70px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '3px 6px', color: 'white', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Height (cm)</span>
            <input
              type="number"
              value={selectedObject.height || 0}
              onChange={(e) => onUpdateProp('height', parseFloat(e.target.value) || 0)}
              style={{ width: '70px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '3px 6px', color: 'white', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Elevation (cm)</span>
            <input
              type="number"
              value={selectedObject.elevation || 0}
              onChange={(e) => onUpdateProp('elevation', parseFloat(e.target.value) || 0)}
              style={{ width: '70px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '3px 6px', color: 'white', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Angle (°)</span>
            <input
              type="number"
              value={selectedObject.angle || 0}
              onChange={(e) => onUpdateProp('angle', parseFloat(e.target.value) || 0)}
              style={{ width: '70px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '3px 6px', color: 'white', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: '#a1a1aa' }}>Color / Material</span>
            <input
              type="color"
              value={selectedObject.color || '#475569'}
              onChange={(e) => onUpdateProp('color', e.target.value)}
              style={{ width: '32px', height: '26px', border: 'none', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
