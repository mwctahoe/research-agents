import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CANVAS_SIZE, CELL_COUNT } from './constants';

const vsSource = `
  attribute vec2 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform vec2 uResolution;

  varying lowp vec4 vColor;

  void main(void) {
    vec2 zeroToOne = aVertexPosition / uResolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    vColor = aVertexColor;
  }
`;

const fsSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const initShaderProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  gl.detachShader(shaderProgram, vertexShader);
  gl.detachShader(shaderProgram, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program link failed:', gl.getProgramInfoLog(shaderProgram));
    gl.deleteProgram(shaderProgram);
    return null;
  }

  return shaderProgram;
};

// Pre-calculate max vertices: grid lines + max snake cells + food
const MAX_QUADS = 2 * (CELL_COUNT + 1) + CELL_COUNT * CELL_COUNT + 1;
const VERTICES_PER_QUAD = 6;

const WebGLCanvas = ({ gameState, width = CANVAS_SIZE, height = CANVAS_SIZE }) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programInfoRef = useRef(null);
  const buffersRef = useRef(null);

  const positionDataRef = useRef(new Float32Array(MAX_QUADS * VERTICES_PER_QUAD * 2));
  const colorDataRef = useRef(new Float32Array(MAX_QUADS * VERTICES_PER_QUAD * 4));

  const [webglError, setWebglError] = useState(null);
  const [contextLost, setContextLost] = useState(false);

  const cleanupGL = useCallback(() => {
    const gl = glRef.current;
    if (!gl) return;

    if (buffersRef.current) {
      gl.deleteBuffer(buffersRef.current.position);
      gl.deleteBuffer(buffersRef.current.color);
      buffersRef.current = null;
    }

    if (programInfoRef.current) {
      gl.deleteProgram(programInfoRef.current.program);
      programInfoRef.current = null;
    }
  }, []);

  const setupGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      setWebglError('WebGL is not supported on this device or browser.');
      return false;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
      setWebglError('Failed to compile or link WebGL shaders.');
      return false;
    }

    const attribLocations = {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    };
    const uniformLocations = {
      resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
    };

    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    if (!positionBuffer || !colorBuffer) {
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (colorBuffer) gl.deleteBuffer(colorBuffer);
      gl.deleteProgram(shaderProgram);
      setWebglError('Failed to allocate WebGL vertex buffers.');
      return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionDataRef.current.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(attribLocations.vertexPosition);
    gl.vertexAttribPointer(attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorDataRef.current.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(attribLocations.vertexColor);
    gl.vertexAttribPointer(attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);

    glRef.current = gl;
    programInfoRef.current = {
      program: shaderProgram,
      attribLocations,
      uniformLocations,
    };
    buffersRef.current = {
      position: positionBuffer,
      color: colorBuffer,
    };

    setWebglError(null);
    return true;
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const programInfo = programInfoRef.current;
    const buffers = buffersRef.current;

    if (!canvas || !gl || !programInfo || !buffers || contextLost || gl.isContextLost()) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const backingWidth = Math.round(width * dpr);
    const backingHeight = Math.round(height * dpr);
    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }

    const { snake, food, gridSize, cellCount } = gameState;
    const positions = positionDataRef.current;
    const colors = colorDataRef.current;
    let posOffset = 0;
    let colorOffset = 0;

    const pushRect = (x, y, w, h, r, g, b, a = 1.0) => {
      if (posOffset + 12 > positions.length) return;

      const x1 = x;
      const x2 = x + w;
      const y1 = y;
      const y2 = y + h;

      positions[posOffset++] = x1;
      positions[posOffset++] = y1;
      positions[posOffset++] = x2;
      positions[posOffset++] = y1;
      positions[posOffset++] = x1;
      positions[posOffset++] = y2;
      positions[posOffset++] = x1;
      positions[posOffset++] = y2;
      positions[posOffset++] = x2;
      positions[posOffset++] = y1;
      positions[posOffset++] = x2;
      positions[posOffset++] = y2;

      for (let i = 0; i < 6; i += 1) {
        colors[colorOffset++] = r;
        colors[colorOffset++] = g;
        colors[colorOffset++] = b;
        colors[colorOffset++] = a;
      }
    };

    // Subtle background grid lines
    const lineThickness = 1;
    for (let i = 1; i < cellCount; i += 1) {
      const offset = i * gridSize;
      pushRect(offset, 0, lineThickness, height, 0.11, 0.14, 0.19, 1.0);
      pushRect(0, offset, width, lineThickness, 0.11, 0.14, 0.19, 1.0);
    }

    // Food
    if (food) {
      pushRect(
        food.x * gridSize + 2,
        food.y * gridSize + 2,
        gridSize - 3,
        gridSize - 3,
        0.97,
        0.31,
        0.31,
        1.0,
      );
    }

    // Snake segments (head brighter, subtle body gradient)
    const snakeLen = snake.length;
    for (let i = 0; i < snakeLen; i += 1) {
      const segment = snake[i];
      if (i === 0) {
        pushRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 1,
          gridSize - 1,
          0.18,
          0.92,
          0.45,
          1.0,
        );
      } else {
        const t = snakeLen > 1 ? i / snakeLen : 0;
        const green = 0.78 - t * 0.25;
        pushRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 1,
          gridSize - 1,
          0.12,
          green,
          0.32,
          1.0,
        );
      }
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.07, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);
    gl.uniform2f(programInfo.uniformLocations.resolution, width, height);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions.subarray(0, posOffset));

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors.subarray(0, colorOffset));

    const vertexCount = posOffset / 2;
    if (vertexCount > 0) {
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    }
  }, [gameState, width, height, contextLost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    setupGL();

    const handleContextLost = (event) => {
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
      setupGL();
      drawScene();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      cleanupGL();
    };
  }, [setupGL, cleanupGL]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  if (webglError) {
    return (
      <div className="canvas-fallback" role="alert">
        <p className="fallback-title">WebGL Unavailable</p>
        <p className="fallback-message">{webglError}</p>
      </div>
    );
  }

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="game-canvas" />
      {contextLost && (
        <div className="canvas-fallback-overlay" role="status">
          <p>Graphics context lost. Attempting to restore...</p>
        </div>
      )}
    </div>
  );
};

export default WebGLCanvas;
