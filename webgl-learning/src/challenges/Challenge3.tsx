import { useEffect, useRef } from 'react';

// Challenge 3: Orbit Camera
//
// GOAL: Create a camera system that lets the user click and drag to rotate around the cube.
//
// STEPS:
// 1. Math Setup:
//    - Store the camera's rotation (pitch and yaw) and radius (distance from object).
//    - Use spherical coordinates to calculate the camera's `[x, y, z]` position based on pitch/yaw/radius.
// 2. View Matrix:
//    - Update your `mat4.lookAt()` function in the render loop.
//    - Position = the calculated `[x, y, z]`
//    - Target = `[0, 0, 0]` (center of the cube)
//    - Up = `[0, 1, 0]`
// 3. Input Handling:
//    - Add event listeners to the canvas: `mousedown`, `mousemove`, `mouseup`.
//    - When dragging, update the `pitch` (up/down drag) and `yaw` (left/right drag) state variables.
//    - Add a `wheel` event listener to adjust the `radius` (zoom in/out).
// 4. RequestAnimationFrame:
//    - Ensure your render loop reads from these updated camera variables every frame.

export function Challenge3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Implement your solution here!
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-emerald-400">Challenge 3: Orbit Camera</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Goal: Implement mouse interaction to control the View Matrix.
          </p>
          <p className="text-sm">
            Check the source code in <code>src/challenges/Challenge3.tsx</code> for step-by-step instructions.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-slate-800 relative cursor-move">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}