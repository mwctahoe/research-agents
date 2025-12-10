import React, { useRef, useEffect } from 'react';

// Vertex shader program
const vsSource = `
  attribute vec2 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform vec2 uResolution;

  varying lowp vec4 vColor;

  void main(void) {
    // Convert from pixels to 0.0 to 1.0
    vec2 zeroToOne = aVertexPosition / uResolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Flip Y axis because WebGL 0,0 is bottom left, but we want top left
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    vColor = aVertexColor;
  }
`;

// Fragment shader program
const fsSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

const initShaderProgram = (gl, vsSource, fsSource) => {
  const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
};

const WebGLCanvas = ({ gameState, width, height }) => {
  const canvasRef = useRef(null);
  const programInfoRef = useRef(null);
  const glRef = useRef(null);
  const buffersRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    glRef.current = gl;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;

    programInfoRef.current = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
      },
    };

    // Create buffers once
    buffersRef.current = {
        position: gl.createBuffer(),
        color: gl.createBuffer()
    };

    // Clean up
    return () => {
        if (buffersRef.current) {
            gl.deleteBuffer(buffersRef.current.position);
            gl.deleteBuffer(buffersRef.current.color);
        }
        if (programInfoRef.current) {
            gl.deleteProgram(programInfoRef.current.program);
        }
    };
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const programInfo = programInfoRef.current;
    const buffers = buffersRef.current;

    if (!gl || !programInfo || !buffers) return;

    const { snake, food, gridSize } = gameState;

    // Draw scene
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.uniformLocations.resolution, width, height);

    const positions = [];
    const colors = [];

    const addRect = (x, y, w, h, r, g, b) => {
      // 2 triangles per rectangle
      const x1 = x;
      const x2 = x + w;
      const y1 = y;
      const y2 = y + h;

      positions.push(
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
      );

      for (let i = 0; i < 6; i++) {
        colors.push(r, g, b, 1.0);
      }
    };

    // Draw Snake
    snake.forEach((segment, index) => {
      // Green for head, lighter green for body
      if (index === 0) {
         addRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1, 0.0, 1.0, 0.0);
      } else {
         addRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1, 0.2, 0.8, 0.2);
      }
    });

    // Draw Food
    addRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1, 1.0, 0.0, 0.0);

    // Bind and set position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

    // Bind and set color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);

    // Draw
    if (positions.length > 0) {
        gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
    }

  }, [gameState, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WebGLCanvas;
