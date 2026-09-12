import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Play, CheckCircle2, Loader2, Maximize2, RefreshCw } from 'lucide-react';

export function SweetHome3DJarRunner() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('ready'); // 'ready', 'loading', 'running', 'error'
  const [statusText, setStatusText] = useState('Java JARs ready to initialize in browser');
  const [progress, setProgress] = useState(0);

  const startJarApplication = async () => {
    try {
      setStatus('loading');
      setStatusText('Initializing WebAssembly Java Runtime...');
      setProgress(20);

      if (typeof window.cheerpjInit !== 'function') {
        throw new Error('CheerpJ WebAssembly loader not found. Please check internet connection.');
      }

      await window.cheerpjInit({
        enablePreciseAppletSizing: true
      });

      setStatusText('Mounting Java Display Canvas into React DOM...');
      setProgress(50);

      const displayDiv = document.getElementById('cheerpj-canvas-container');
      displayDiv.innerHTML = '';
      window.cheerpjCreateDisplay(-1, -1, displayDiv);

      setStatusText('Executing SweetHome3D.jar bytecode...');
      setProgress(80);

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

      setStatus('running');
      setStatusText('Sweet Home 3D JAR is running in WebAssembly!');
      setProgress(100);

      // Launch Java Main Class from JAR
      await window.cheerpjRunMain('com.eteks.sweethome3d.SweetHome3D', classpath);
    } catch (err) {
      console.error('Failed to run Java JAR in browser:', err);
      setStatus('error');
      setStatusText('Error launching JAR: ' + (err.message || err));
    }
  };

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: '#09090b', position: 'relative' }}>
      {/* JAR Status Banner */}
      <div style={{
        height: '48px',
        background: '#18181b',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu color="#a855f7" size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f4f4f5' }}>
            Java JAR Runtime (CheerpJ WebAssembly)
          </span>
          <span style={{
            background: status === 'running' ? '#059669' : status === 'loading' ? '#d97706' : '#27272a',
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            fontWeight: 700
          }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{statusText}</span>

          {status === 'ready' && (
            <button
              onClick={startJarApplication}
              style={{
                background: '#a855f7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={14} fill="white" /> Launch Java JAR
            </button>
          )}

          {status === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.85rem' }}>
              <Loader2 className="animate-spin" size={16} /> Loading JAR ({progress}%)
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Host Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#121214',
          overflow: 'hidden'
        }}
      >
        {status === 'ready' && (
          <div style={{ textAlign: 'center', maxWidth: '500px', padding: '24px', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}>
            <Cpu size={48} color="#a855f7" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fafafa' }}>Run Native SweetHome3D.jar in React</h2>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '18px' }}>
              This executes the exact compiled Java bytecode (`SweetHome3D.jar`, `sunflow.jar`, `j3dcore.jar`) directly in your browser using the CheerpJ WebAssembly virtual machine.
            </p>
            <button
              onClick={startJarApplication}
              style={{
                background: '#a855f7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={16} fill="white" /> Click to Run Java JAR in Browser
            </button>
          </div>
        )}

        {/* DOM node where CheerpJ mounts the Java Swing GUI Canvas */}
        <div
          id="cheerpj-canvas-container"
          style={{
            width: '100%',
            height: '100%',
            display: status === 'running' ? 'block' : 'none'
          }}
        />
      </div>
    </div>
  );
}
