import { useEffect, useRef } from 'react';
import { createProgramFromSources } from '../utils/webgl';
import { mat4 } from 'gl-matrix';

// Vertex Shader
// Now takes 3D positions and uses matrices to transform them to clip space.
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_color;

  // Uniforms are variables that stay the same for all vertices in a draw call
  uniform mat4 u_matrix;

  varying vec4 v_color;

  void main() {
    // Multiply the position by the matrix.
    // Order matters! matrix * vector
    gl_Position = u_matrix * a_position;

    // Pass the color to the fragment shader.
    v_color = a_color;
  }
`;

// Fragment Shader
const fragmentShaderSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

export function Lesson3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const program = createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    // Look up locations
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const colorLocation = gl.getAttribLocation(program, "a_color");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer for positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define a 3D cube (12 triangles, 36 vertices)
    // We duplicate vertices for each face so each face can have a different solid color.
    const positions = new Float32Array([
      // Front face
      -0.5, -0.5,  0.5,
       0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,

      // Back face
      -0.5, -0.5, -0.5,
      -0.5,  0.5, -0.5,
       0.5,  0.5, -0.5,
      -0.5, -0.5, -0.5,
       0.5,  0.5, -0.5,
       0.5, -0.5, -0.5,

      // Top face
      -0.5,  0.5, -0.5,
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5,  0.5, -0.5,
       0.5,  0.5,  0.5,
       0.5,  0.5, -0.5,

      // Bottom face
      -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5, -0.5,  0.5,
      -0.5, -0.5, -0.5,
       0.5, -0.5,  0.5,
      -0.5, -0.5,  0.5,

      // Right face
       0.5, -0.5, -0.5,
       0.5,  0.5, -0.5,
       0.5,  0.5,  0.5,
       0.5, -0.5, -0.5,
       0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,

      // Left face
      -0.5, -0.5, -0.5,
      -0.5, -0.5,  0.5,
      -0.5,  0.5,  0.5,
      -0.5, -0.5, -0.5,
      -0.5,  0.5,  0.5,
      -0.5,  0.5, -0.5,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Create a buffer for colors
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Colors for each face (RGBA)
    const faceColors = [
      [0.2, 0.6, 1.0, 1.0], // Front: Blue
      [1.0, 0.2, 0.2, 1.0], // Back: Red
      [0.2, 1.0, 0.2, 1.0], // Top: Green
      [1.0, 1.0, 0.2, 1.0], // Bottom: Yellow
      [1.0, 0.6, 0.2, 1.0], // Right: Orange
      [0.8, 0.2, 0.8, 1.0], // Left: Purple
    ];

    // Build the color array: 6 faces, 2 triangles per face, 3 vertices per triangle = 36 vertices
    const colors: number[] = [];
    faceColors.forEach((color) => {
      // 6 vertices per face
      for (let i = 0; i < 6; i++) {
        colors.push(...color);
      }
    });
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Function to convert degrees to radians
    const degToRad = (d: number) => (d * Math.PI) / 180;

    let rotation = 0;

    const drawScene = (time: number) => {
      // Resize canvas
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // --- Important 3D Concept: Depth Testing ---
      // WebGL draws things in the order they are called. Without depth testing,
      // objects drawn later will appear on top of objects drawn earlier, even if they are "behind" them in 3D space.
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE); // Don't draw back-facing triangles

      // Clear the canvas AND the depth buffer
      gl.clearColor(0.1, 0.1, 0.15, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);

      // Setup Position Attribute
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      // Setup Color Attribute
      gl.enableVertexAttribArray(colorLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

      // --- Compute Matrices ---

      // 1. Projection Matrix
      // Converts from camera space to clip space (adds perspective)
      const fieldOfViewRadians = degToRad(60);
      const aspect = canvas.clientWidth / canvas.clientHeight;
      const zNear = 1;
      const zFar = 2000;
      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);

      // 2. Camera/View Matrix
      // Positions the world relative to the camera
      const cameraPosition = [0, 0, 3];
      const target = [0, 0, 0];
      const up = [0, 1, 0];
      const viewMatrix = mat4.create();
      mat4.lookAt(viewMatrix, cameraPosition as [number, number, number], target as [number, number, number], up as [number, number, number]);

      // 3. Model Matrix
      // Positions the object in the world
      const modelMatrix = mat4.create();

      // Animate rotation based on time
      rotation = time * 0.001;
      mat4.rotateX(modelMatrix, modelMatrix, rotation);
      mat4.rotateY(modelMatrix, modelMatrix, rotation * 0.7);

      // 4. Multiply them all together
      // Remember: matrix multiplication is applied right-to-left
      // Final Matrix = Projection * View * Model
      const matrix = mat4.create();
      mat4.multiply(matrix, projectionMatrix, viewMatrix);
      mat4.multiply(matrix, matrix, modelMatrix);

      // Pass the computed matrix to the shader
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Draw the geometry
      gl.drawArrays(gl.TRIANGLES, 0, 36);

      // Loop
      requestRef.current = requestAnimationFrame(drawScene);
    };

    requestRef.current = requestAnimationFrame(drawScene);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(colorBuffer);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Lesson 3: 3D Cube</h2>
        <div className="text-slate-300 space-y-2">
          <p>
            Moving into 3D! This lesson introduces Depth Testing and Matrices (using the <code>gl-matrix</code> library)
            to position objects, move the camera, and add perspective.
          </p>
          <p className="text-sm bg-slate-800 p-3 rounded border border-slate-700">
            <strong>Key concepts:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li><strong>gl.enable(gl.DEPTH_TEST):</strong> Ensures things closer to the camera are drawn over things further away.</li>
              <li><strong>Uniforms:</strong> Variables passed to the shader that stay constant for all vertices in a draw call.</li>
              <li><strong>Model Matrix:</strong> Places the object in the world (Translation, Rotation, Scale).</li>
              <li><strong>View/Camera Matrix:</strong> Places the world relative to the camera.</li>
              <li><strong>Projection Matrix:</strong> Applies perspective distortion (closer objects look bigger).</li>
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