import { useEffect, useRef } from 'react';
import { createProgramFromSources } from '../utils/webgl';

// --- Shaders ---
// Vertex Shader: Runs once per vertex. Responsible for setting `gl_Position` (where the vertex is on screen).
const vertexShaderSource = `
  // An attribute is an input (in) from a buffer
  attribute vec2 a_position;

  // A varying is used to pass data from the vertex shader to the fragment shader
  varying vec3 v_color;

  void main() {
    // gl_Position is a special variable a vertex shader is responsible for setting.
    // It expects a vec4(x, y, z, w). Since we have 2D coordinates (x, y),
    // we set z=0 and w=1 (w is used for perspective division, 1 means no division).
    gl_Position = vec4(a_position, 0.0, 1.0);

    // Generate a color based on position just to make it interesting
    // Map from [-1, 1] to [0, 1]
    v_color = vec3(a_position.x * 0.5 + 0.5, a_position.y * 0.5 + 0.5, 0.5);
  }
`;

// Fragment Shader: Runs once per pixel. Responsible for setting `gl_FragColor` (the color of the pixel).
const fragmentShaderSource = `
  // Fragment shaders don't have a default precision, so we must define it
  precision mediump float;

  // The varying passed in from the vertex shader. WebGL will interpolate this
  // value between vertices automatically!
  varying vec3 v_color;

  void main() {
    // Set the pixel color to our interpolated varying color
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

export function Lesson2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      alert('Your browser does not support WebGL!');
      return;
    }

    // 1. Compile Shaders and Link Program
    const program = createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    // 2. Look up locations
    // We need to know where in memory the GPU is expecting our attribute 'a_position'
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // 3. Create Buffers and provide data
    // Create a buffer object
    const positionBuffer = gl.createBuffer();

    // Bind it to the ARRAY_BUFFER (think of this as a global variable inside WebGL)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define the triangle vertices in clip space (-1 to +1)
    // Three 2D points (x, y)
    const positions = [
      0.0,  0.5,  // Top
     -0.5, -0.5,  // Bottom left
      0.5, -0.5,  // Bottom right
    ];

    // Pass the data to the buffer.
    // WebGL needs strongly typed arrays (Float32Array).
    // gl.STATIC_DRAW is a hint that we won't change this data often.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // --- Rendering ---
    const render = () => {
      // Resize canvas to match display size
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas
      gl.clearColor(0.1, 0.1, 0.15, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Tell WebGL to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the attribute
      gl.enableVertexAttribArray(positionAttributeLocation);

      // Bind the position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      const size = 2;          // 2 components per iteration (x, y)
      const type = gl.FLOAT;   // the data is 32bit floats
      const normalize = false; // don't normalize the data
      const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionAttributeLocation, size, type, normalize, stride, offset);

      // Execute the GL program to draw
      const primitiveType = gl.TRIANGLES;
      const drawOffset = 0;
      const count = 3; // 3 vertices to draw
      gl.drawArrays(primitiveType, drawOffset, count);
    };

    render();
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
      // Cleanup WebGL resources
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Lesson 2: Basic Triangle</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            The "Hello World" of graphics programming. We compile a Vertex Shader and a Fragment Shader,
            create a buffer containing our vertex coordinates, and tell WebGL to draw it.
          </p>
          <p className="text-sm bg-slate-800 p-3 rounded border border-slate-700">
            <strong>Key concepts:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li><strong>Shaders:</strong> GLSL programs running on the GPU.</li>
              <li><strong>Attributes:</strong> Inputs into the vertex shader.</li>
              <li><strong>Varyings:</strong> Variables passed from vertex to fragment shader. Automatically interpolated!</li>
              <li><strong>Buffers:</strong> GPU memory holding our data (vertices).</li>
              <li><code>gl.drawArrays(gl.TRIANGLES, ...)</code>: The draw call.</li>
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