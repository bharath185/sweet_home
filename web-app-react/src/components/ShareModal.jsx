import React, { useState } from 'react';
import { ShareService } from '../services/ShareService';
import { X, Copy, Check, ExternalLink, Sparkles, Eye, Edit3, Link2 } from 'lucide-react';

export function ShareModal({ isOpen, onClose, homeState }) {
  const [shareType, setShareType] = useState('presentation'); // 'presentation' or 'edit'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = ShareService.generateShareUrl(homeState, shareType);

  const handleCopy = async () => {
    await ShareService.copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 color="#3b82f6" size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fafafa' }}>
              Share Design with Customer
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.5 }}>
            Send this self-contained link to your client or customer. They can immediately open it in any browser (mobile, tablet, or desktop) with no installation or account required.
          </p>

          {/* Share Type Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div
              onClick={() => setShareType('presentation')}
              style={{
                border: `2px solid ${shareType === 'presentation' ? '#3b82f6' : '#27272a'}`,
                background: shareType === 'presentation' ? 'rgba(59, 130, 246, 0.08)' : '#202024',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem', color: shareType === 'presentation' ? '#60a5fa' : '#fafafa' }}>
                <Eye size={16} /> 3D Tour Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>
                Full-screen realistic 3D walkthrough for clients.
              </div>
            </div>

            <div
              onClick={() => setShareType('edit')}
              style={{
                border: `2px solid ${shareType === 'edit' ? '#3b82f6' : '#27272a'}`,
                background: shareType === 'edit' ? 'rgba(59, 130, 246, 0.08)' : '#202024',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem', color: shareType === 'edit' ? '#60a5fa' : '#fafafa' }}>
                <Edit3 size={16} /> Interactive Studio
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>
                Allows client to modify furniture and customize.
              </div>
            </div>
          </div>

          {/* Generated URL Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '4px 6px',
            gap: '8px'
          }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e4e4e7',
                fontSize: '0.8rem',
                flex: 1,
                outline: 'none',
                padding: '6px 8px'
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#059669' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: '#141416',
          borderTop: '1px solid #27272a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
            {homeState.furniture.length} items • {homeState.walls.length} walls
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleOpenPreview}
              style={{
                background: '#27272a',
                color: '#e4e4e7',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ExternalLink size={13} /> Test Preview Link
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#3f3f46',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
