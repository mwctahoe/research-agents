import { useEffect, useRef } from 'react';

// Challenge 4: Post-processing (Framebuffers)
//
// GOAL: Render the scene to a texture, then apply an effect (like grayscale,
//       blur, or scanlines) by rendering that texture to a full-screen quad.
//
// STEPS:
// 1. Setup Framebuffer:
//    - Create a texture to act as your color target.
//    - Create a renderbuffer to act as your depth target.
//    - Create a framebuffer (`gl.createFramebuffer()`) and attach both the texture and the renderbuffer to it.
// 2. Multi-pass Rendering (The Loop):
//    --- PASS 1 (Render to Texture) ---
//    - Bind your custom framebuffer: `gl.bindFramebuffer(gl.FRAMEBUFFER, myFramebuffer)`.
//    - Set viewport, clear, and draw your 3D cube as normal.
//    - The output now goes into your texture, NOT the screen.
//    --- PASS 2 (Render to Screen) ---
//    - Bind the default framebuffer (the screen): `gl.bindFramebuffer(gl.FRAMEBUFFER, null)`.
//    - Clear the screen.
//    - Use a completely different shader program (your post-processing program).
// 3. Post-processing Program:
//    - The geometry is just a 2D quad (2 triangles) that covers the entire screen (clip coordinates: -1 to +1).
//    - The vertex shader just passes position and texture coordinates through.
//    - The fragment shader samples from the texture you rendered in Pass 1.
//    - Apply your effect here (e.g. `color.r = (color.r + color.g + color.b) / 3.0` for grayscale).

export function Challenge4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Implement your solution here!
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-emerald-400">Challenge 4: Post-processing</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Goal: Learn about Framebuffers to render offline and apply full-screen shader effects.
          </p>
          <p className="text-sm">
            Check the source code in <code>src/challenges/Challenge4.tsx</code> for step-by-step instructions.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}