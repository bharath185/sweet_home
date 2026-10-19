'use client';

import React, { useState } from 'react';
import { RotateLeftOutlined, EyeOutlined, CompassOutlined } from '@ant-design/icons';
import { FloorTemplate } from '../types/plan';

interface TemplateThumbnailProps {
  template: FloorTemplate;
  isLight: boolean;
  onPreview3D: () => void;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  template,
  isLight,
  onPreview3D,
}) => {
  const id = template.id || '';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Map template IDs to realistic 3D architectural cutaway renders
  const getRenderPath = (tplId: string): string => {
    if (tplId === '1-bedroom-apt') return '/templates/1-bedroom-apt.jpg';
    if (tplId === 'studio' || tplId === 'starter-emma-studio') return '/templates/studio.jpg';
    if (tplId === '2-bedroom-apt' || tplId === 'starter-sarah-suite') return '/templates/2-bedroom-apt.jpg';
    if (tplId.includes('villa') || tplId.includes('house') || tplId.includes('mezzanine')) return '/templates/villa.jpg';
    if (tplId === 'empty-home') return '/templates/empty-home.jpg';
    if (tplId.includes('bow-window')) return '/templates/1-bedroom-apt.jpg';
    return '/templates/1-bedroom-apt.jpg';
  };

  const imageSrc = getRenderPath(id);

  return (
    <div
      onClick={onPreview3D}
      style={{
        position: 'relative',
        width: '100%',
        height: 160,
        backgroundColor: '#0b1120',
        overflow: 'hidden',
        cursor: 'pointer',
        borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1f293d',
      }}
      className="group"
    >
      {/* 1. Photorealistic 3D Architectural Cutaway Render */}
      <img
        src={imageSrc}
        alt={template.name}
        onError={(e) => {
          // Fallback gracefully to the high-res 1-bedroom render if specific render is pending
          if (imageSrc !== '/templates/1-bedroom-apt.jpg') {
            (e.target as HTMLImageElement).src = '/templates/1-bedroom-apt.jpg';
          } else {
            setImageError(true);
          }
        }}
        onLoad={() => setImageLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease',
          display: imageError ? 'none' : 'block',
        }}
        className="group-hover:scale-105"
      />

      {/* 2. Sleek Architectural Vignette Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 17, 32, 0.75) 0%, rgba(11, 17, 32, 0.05) 55%, rgba(11, 17, 32, 0.35) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Top Architectural Badge */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '3px 8px',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#e2e8f0',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
        <span>3D RENDER</span>
      </div>

      {/* 4. Area / Floors Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          color: '#f8fafc',
          fontSize: 11,
          fontWeight: 700,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{template.area || 'Spacious'}</span>
        <span>•</span>
        <span>{template.floors || 1} {template.floors === 1 ? 'Floor' : 'Floors'}</span>
      </div>

      {/* 5. Interactive Hover Overlay: Rotate & Inspect in 3D */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: 0,
          transition: 'opacity 0.25s ease',
        }}
        className="group-hover:opacity-100"
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            padding: '7px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.55)',
            transform: 'translateY(4px)',
            transition: 'transform 0.25s ease',
          }}
          className="group-hover:translate-y-0"
        >
          <RotateLeftOutlined style={{ fontSize: 14 }} />
          <span>Rotate in 3D</span>
        </div>
        <span style={{ color: '#cbd5e1', fontSize: 10, fontWeight: 600 }}>
          Click to inspect 360° model
        </span>
      </div>
    </div>
  );
};
