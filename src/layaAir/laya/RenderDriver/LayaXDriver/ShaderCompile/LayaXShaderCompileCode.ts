/**
 * LayaX Shader compile code utilities.
 *
 * Handles GLSL source processing for the LayaX/wgpu backend.
 * The compilation pipeline mirrors WebGPU: GLSL → SPIR-V → WGSL.
 *
 * TODO(Q17): Verify glslang.wasm and naga.wasm work in Conch V8 environment.
 * TODO(Q18): Determine if shader compilation should be sync or async.
 */

/**
 * Processes GLSL shader source code for LayaX pipeline.
 * Handles define injection, include resolution, and format adaptation.
 */
export class LayaXShaderCompileCode {

    /**
     * Process vertex shader source.
     * @param vs Raw GLSL vertex shader source
     * @param defineString Define string to inject
     * @returns Processed GLSL source ready for compilation
     */
    static processVS(vs: string, defineString: string): string {
        // Inject defines after #version directive
        return LayaXShaderCompileCode._injectDefines(vs, defineString);
    }

    /**
     * Process fragment shader source.
     * @param fs Raw GLSL fragment shader source
     * @param defineString Define string to inject
     * @returns Processed GLSL source ready for compilation
     */
    static processFS(fs: string, defineString: string): string {
        return LayaXShaderCompileCode._injectDefines(fs, defineString);
    }

    /**
     * Inject define directives into GLSL source after the #version line.
     */
    private static _injectDefines(source: string, defineString: string): string {
        if (!defineString || defineString.length === 0) {
            return source;
        }

        // Find the end of #version line
        const versionIdx = source.indexOf("#version");
        if (versionIdx >= 0) {
            const lineEnd = source.indexOf("\n", versionIdx);
            if (lineEnd >= 0) {
                return source.substring(0, lineEnd + 1) + defineString + "\n" + source.substring(lineEnd + 1);
            }
        }

        // No #version found — prepend defines
        return defineString + "\n" + source;
    }
}
