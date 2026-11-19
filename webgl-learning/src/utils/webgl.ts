/**
 * Compiles a shader object.
 *
 * @param gl The WebGL rendering context
 * @param type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param source The GLSL source code
 * @returns The compiled WebGLShader, or null if compilation fails
 */
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
        console.error("Failed to create shader object");
        return null;
    }

    // Set the source code and compile
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(`Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Links a vertex and fragment shader into a WebGLProgram.
 *
 * @param gl The WebGL rendering context
 * @param vertexShader The compiled vertex shader
 * @param fragmentShader The compiled fragment shader
 * @returns The linked WebGLProgram, or null if linking fails
 */
export function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) {
        console.error("Failed to create program object");
        return null;
    }

    // Attach shaders and link
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check for linking errors
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(`Failed to link program:\n${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

/**
 * Convenience function to create a program from source strings.
 */
export function createProgramFromSources(
    gl: WebGLRenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
): WebGLProgram | null {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);

    // Once linked, we don't strictly need the individual shader objects anymore
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}
