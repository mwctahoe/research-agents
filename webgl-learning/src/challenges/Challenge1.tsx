import { useEffect, useRef } from 'react';

// Challenge 1: Textures
//
// GOAL: Apply an image texture to the rotating cube instead of solid colors.
//
// STEPS:
// 1. Update the Vertex Shader:
//    - Remove `a_color` and `v_color`.
//    - Add an attribute `vec2 a_texcoord` for texture coordinates (U,V).
//    - Pass `a_texcoord` to a varying `vec2 v_texcoord`.
// 2. Update the Fragment Shader:
//    - Accept the varying `vec2 v_texcoord`.
//    - Add a uniform `sampler2D u_texture`.
//    - Use `texture2D(u_texture, v_texcoord)` to get the final pixel color.
// 3. Update Buffers:
//    - Replace the color buffer with a texture coordinate buffer.
//    - Each vertex needs a (U,V) coordinate between 0.0 and 1.0.
//    - E.g., for a face, corners might be (0,0), (1,0), (1,1), (0,0), (1,1), (0,1).
// 4. Create and Load Texture:
//    - Create a texture using `gl.createTexture()`.
//    - Bind it using `gl.bindTexture(gl.TEXTURE_2D, texture)`.
//    - Since images load asynchronously, you might want to fill the texture with a
//      single pixel (e.g. blue) immediately using `gl.texImage2D`, then update it
//      when the image's `onload` event fires.
//    - Use a sample image or procedurally generate one using a Canvas/Uint8Array.

export function Challenge1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Implement your solution here!
    // Feel free to copy the boilerplate from Lesson 3 to get started quickly.
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-emerald-400">Challenge 1: Textures</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Goal: Apply a 2D image texture to the 3D cube.
          </p>
          <p className="text-sm">
            Check the source code in <code>src/challenges/Challenge1.tsx</code> for step-by-step instructions.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}