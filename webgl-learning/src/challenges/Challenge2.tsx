import { useEffect, useRef } from 'react';

// Challenge 2: Basic Lighting (Phong Reflection Model)
//
// GOAL: Implement directional or point lighting to make the 3D cube look truly 3D
//       by having differently lit faces depending on their angle to a light source.
//
// STEPS:
// 1. Add Normals:
//    - The GPU needs to know which way a face is pointing to calculate lighting.
//    - Create a buffer for "normals" (a 3D vector representing the direction perpendicular to the face).
//    - e.g., the front face normal is (0, 0, 1), the right face is (1, 0, 0).
// 2. Update Vertex Shader:
//    - Add `attribute vec3 a_normal`.
//    - Calculate the transformed normal: `mat4 u_normalMatrix * a_normal`.
//      (The normal matrix is the transpose of the inverse of the model/view matrix).
//    - Pass the transformed normal to a varying `v_normal`.
//    - If doing point lights, pass the fragment's world position to `v_surfaceWorldPosition`.
// 3. Update Fragment Shader:
//    - Normalize `v_normal`.
//    - Define a light direction vector `uniform vec3 u_lightDirection`.
//    - Calculate the "dot product" between the normal and the reversed light direction.
//      `float light = dot(normal, -lightDirection);`
//    - Multiply the base color by this `light` value (clamped between 0 and 1).
// 4. Advanced (Specular):
//    - Calculate the reflection vector.
//    - Calculate the view vector (direction to camera).
//    - Compute specular highlights using the dot product of reflection and view.

export function Challenge2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Implement your solution here!
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-emerald-400">Challenge 2: Basic Lighting</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Goal: Implement the Phong reflection model (ambient, diffuse, and specular lighting).
          </p>
          <p className="text-sm">
            Check the source code in <code>src/challenges/Challenge2.tsx</code> for step-by-step instructions.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}