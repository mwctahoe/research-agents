import { useEffect, useRef } from 'react';

export function Lesson1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Get the WebGL Context
    // We request the 'webgl' context. You could also request 'webgl2' for more modern features,
    // but learning WebGL 1 first builds a strong foundation.
    const gl = canvas.getContext('webgl');

    if (!gl) {
      alert('Your browser does not support WebGL!');
      return;
    }

    // Handle canvas resizing
    const resize = () => {
      // Set the internal resolution to match the display size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      // Tell WebGL how to convert from clip space (-1 to +1) to pixels
      // This maps the WebGL coordinates to our canvas dimensions
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // Initial resize
    resize();
    window.addEventListener('resize', resize);

    // 2. Set the Clear Color
    // gl.clearColor(red, green, blue, alpha)
    // Values are between 0.0 and 1.0. Here we use a dark blue/slate color.
    gl.clearColor(0.05, 0.1, 0.15, 1.0);

    // 3. Clear the Color Buffer
    // This actually paints the canvas with the color we just specified.
    // We tell it to clear the COLOR_BUFFER_BIT. Later we'll also clear the DEPTH_BUFFER_BIT.
    gl.clear(gl.COLOR_BUFFER_BIT);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Lesson 1: Initialization</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Welcome to WebGL! This lesson demonstrates the absolute minimum required to set up a WebGL context and paint the screen.
          </p>
          <p className="text-sm bg-slate-800 p-3 rounded border border-slate-700">
            <strong>Key concepts:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li><code>canvas.getContext('webgl')</code>: Obtains the rendering context.</li>
              <li><code>gl.viewport(...)</code>: Tells WebGL how to map internal coordinates to screen pixels.</li>
              <li><code>gl.clearColor(...)</code>: Sets the default background color (state).</li>
              <li><code>gl.clear(...)</code>: Executes the clear operation using the set color.</li>
            </ul>
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}