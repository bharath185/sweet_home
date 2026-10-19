import * as THREE from 'three';

/**
 * Safely creates a WebGLRenderer, recovering lost contexts and handling browser context limits gracefully.
 */
export function createSafeWebGLRenderer(
  parameters: THREE.WebGLRendererParameters = {}
): THREE.WebGLRenderer | null {
  if (typeof window === 'undefined') return null;

  const canvas = parameters.canvas || document.createElement('canvas');

  // Attempt 1: Standard requested configuration
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      ...parameters,
    });
    return renderer;
  } catch (err1) {
    console.warn('Attempt 1 to create WebGLRenderer failed, attempting low-power fallback:', err1);
  }

  // Attempt 2: Fallback with low-power, medium precision (handles tight GPU context limits)
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
      precision: 'mediump',
    });
    return renderer;
  } catch (err2) {
    console.error('All attempts to create WebGLRenderer failed:', err2);
    return null;
  }
}

/**
 * Completely releases a WebGLRenderer and forces context loss so browser context limits are never exceeded.
 */
export function safelyDisposeRenderer(
  renderer: THREE.WebGLRenderer | null | undefined,
  mountNode?: HTMLElement | null
) {
  if (!renderer) return;

  try {
    // 1. Remove canvas from DOM
    if (mountNode && renderer.domElement && mountNode.contains(renderer.domElement)) {
      mountNode.removeChild(renderer.domElement);
    }

    // 2. Three.js disposal
    renderer.dispose();

    // 3. Force WebGL context release so browser frees GPU context slot
    renderer.forceContextLoss();

    const gl = renderer.getContext();
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        ext.loseContext();
      }
    }
  } catch (err) {
    console.warn('Error during safelyDisposeRenderer:', err);
  }
}
