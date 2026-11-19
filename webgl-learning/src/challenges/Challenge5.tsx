import { useEffect, useRef } from 'react';

// Challenge 5: Instanced Drawing
//
// GOAL: Draw thousands of cubes efficiently. Instead of issuing thousands of
//       draw calls (which is slow), use Instancing to draw them all in ONE call.
//
// STEPS:
// Note: Instancing requires the ANGLE_instanced_arrays extension in WebGL 1.
//       `const ext = gl.getExtension('ANGLE_instanced_arrays');`
//
// 1. Setup Instance Data Buffer:
//    - Create a new buffer to hold data that changes per instance (like position offset or color).
//    - e.g., an array of 10,000 [x, y, z] offsets.
// 2. Update Vertex Shader:
//    - Add an attribute for the instance data: `attribute vec3 a_instanceOffset`.
//    - Add this offset to the vertex position before multiplying by the matrices.
// 3. Configure the Instance Attribute:
//    - Bind the instance buffer and set up the pointer as usual.
//    - Crucially, tell WebGL this attribute advances once per INSTANCE, not once per vertex:
//      `ext.vertexAttribDivisorANGLE(instanceOffsetLocation, 1);`
// 4. Draw Call:
//    - Instead of `gl.drawArrays`, use the instanced version:
//      `ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 36, 10000);`

export function Challenge5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Implement your solution here!
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-emerald-400">Challenge 5: Instanced Drawing</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Goal: Use WebGL extensions to efficiently render thousands of objects in a single draw call.
          </p>
          <p className="text-sm">
            Check the source code in <code>src/challenges/Challenge5.tsx</code> for step-by-step instructions.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}