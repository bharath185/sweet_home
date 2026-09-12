import React, { useEffect, useState, useRef } from 'react';
import { Home, Sparkles, Loader2, AlertCircle, RefreshCw, Maximize, Play } from 'lucide-react';

let cheerpjStarted = false;

export function App() {
  const [status, setStatus] = useState('loading'); // 'loading', 'running', 'error'
  const [statusMessage, setStatusMessage] = useState('Initializing CheerpJ WebAssembly Java Engine...');
  const [progress, setProgress] = useState(15);
  const containerRef = useRef(null);

  useEffect(() => {
    if (cheerpjStarted) return;
    cheerpjStarted = true;

    async function launchCheerpJ() {
      try {
        setStatusMessage('Loading CheerpJ 3.0 WebAssembly JVM...');
        setProgress(30);

        let retries = 0;
        while (typeof window.cheerpjInit !== 'function' && retries < 25) {
          await new Promise(r => setTimeout(r, 200));
          retries++;
        }

        if (typeof window.cheerpjInit !== 'function') {
          throw new Error('CheerpJ WebAssembly loader not found. Please verify internet connection.');
        }

        setStatusMessage('Initializing Java SE 8 WebAssembly Runtime...');
        setProgress(50);

        await window.cheerpjInit({
          version: 8
        });

        setStatusMessage('Mounting Java Swing Display Canvas...');
        setProgress(70);

        const container = document.getElementById('cheerpj-canvas-host');
        if (container) {
          container.innerHTML = '';
          window.cheerpjCreateDisplay(-1, -1, container);
        }

        setStatusMessage('Loading SweetHome3D.jar (14.6 MB) and classpath...');
        setProgress(85);

        const classpath = [
          '/app/SweetHome3D.jar',
          '/app/lib/j3dcore.jar',
          '/app/lib/vecmath.jar',
          '/app/lib/j3dutils.jar',
          '/app/lib/iText-2.1.7.jar',
          '/app/lib/sunflow-0.07.3i.jar',
          '/app/lib/freehep-vectorgraphics-svg-2.1.1b.jar',
          '/app/lib/batik-svgpathparser-1.7.jar'
        ].join(':');

        setStatusMessage('Starting Sweet Home 3D Java Application...');
        setProgress(100);

        setTimeout(() => {
          setStatus('running');
        }, 3000);

        // Run Java Application with bypassed socket flags
        await window.cheerpjRunMain(
          'com.eteks.sweethome3d.SweetHome3D',
          classpath,
          '-Dcom.eteks.sweethome3d.noSingleInstance=true',
          '-Dcom.eteks.sweethome3d.j3d.checkDriver=false'
        );

      } catch (err) {
        console.error('CheerpJ execution error:', err);
        setStatus('error');
        setStatusMessage('CheerpJ Error: ' + (err.message || err));
      }
    }

    launchCheerpJ();
  }, []);

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
      color: '#f4f4f5',
      overflow: 'hidden'
    }}>
      {/* Top React Header */}
      <header style={{
        height: '44px',
        background: '#18181b',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Home color="#3b82f6" size={20} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Sweet Home 3D</span>
          <span style={{
            background: status === 'running' ? '#059669' : '#a855f7',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            textTransform: 'uppercase'
          }}>
            {status === 'running' ? 'Native Java Active' : 'CheerpJ WebAssembly'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#27272a',
              color: '#e4e4e7',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} /> Reload
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Maximize size={12} /> Fullscreen
          </button>
        </div>
      </header>

      {/* Main Canvas Host where the original Java Swing GUI renders */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#121214', overflow: 'hidden' }}>
        
        {/* Loading Overlay */}
        {status === 'loading' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 9, 11, 0.94)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(168, 85, 247, 0.35)'
            }}>
              <Home size={28} color="white" />
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fafafa' }}>
              Executing SweetHome3D.jar in WebAssembly
            </div>

            <div style={{ width: '300px', height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a855f7, #3b82f6)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a1a1aa' }}>
              <Loader2 className="animate-spin" size={14} color="#a855f7" />
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {status === 'error' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            gap: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <AlertCircle size={40} color="#ef4444" />
            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.1rem' }}>WebAssembly Startup Error</div>
            <div style={{ color: '#a1a1aa', fontSize: '0.85rem', maxWidth: '450px' }}>{statusMessage}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Retry Launch
            </button>
          </div>
        )}

        {/* CheerpJ Display Host DOM Node */}
        <div
          id="cheerpj-canvas-host"
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
    </div>
  );
}
