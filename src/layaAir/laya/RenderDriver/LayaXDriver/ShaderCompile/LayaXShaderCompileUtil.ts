/**
 * LayaX Shader compile utilities.
 *
 * Provides GLSL source adaptation for the LayaX/wgpu backend.
 * The Rust side compiles GLSL → SPIR-V (glslang) → WGSL (naga),
 * so the TS side only needs to ensure the GLSL is well-formed for that pipeline.
 *
 * TODO(Q17): Verify glslang.wasm and naga.wasm work in Conch V8 environment.
 * TODO(Q18): Determine if shader compilation should be sync or async.
 */

import { LayaXShaderCompileCode } from "./LayaXShaderCompileCode";

/**
 * Utility class for preparing GLSL shader source for the LayaX pipeline.
 *
 * Unlike WebGPU which does extensive TS-side preprocessing (sampler splitting,
 * uniform extraction, etc.), LayaX delegates compilation to the Rust backend.
 * This util handles only the source-level adaptations needed before handoff.
 */
export class LayaXShaderCompileUtil {

    /**
     * Strip GLSL ES precision qualifiers (lowp, mediump, highp) from source.
     * wgpu/naga GLSL parser may not accept precision qualifiers in all contexts.
     * This keeps `precision` declarations intact (they are valid GLSL) but removes
     * inline qualifiers on variable declarations and function parameters.
     */
    static stripInlinePrecision(source: string): string {
        // Remove inline precision qualifiers (e.g., "mediump float x" → "float x")
        // but preserve "precision mediump float;" standalone declarations.
        return source.replace(
            /(?<!precision\s+)(lowp|mediump|highp)\s+/g,
            ''
        );
    }

    /**
     * Ensure the GLSL source has a #version directive.
     * If absent, prepend `#version 300 es` for GLSL ES 3.0 compatibility.
     * The Rust glslang compiler requires a #version directive.
     */
    static ensureVersion(source: string, version: string = "#version 300 es"): string {
        if (source.indexOf("#version") >= 0) {
            return source;
        }
        return version + "\n" + source;
    }

    /**
     * Process vertex shader source for LayaX pipeline.
     * Applies define injection and format normalization.
     */
    static processVS(vs: string, defineString: string): string {
        let result = LayaXShaderCompileCode.processVS(vs, defineString);
        result = LayaXShaderCompileUtil.ensureVersion(result);
        return result;
    }

    /**
     * Process fragment shader source for LayaX pipeline.
     * Applies define injection and format normalization.
     */
    static processFS(fs: string, defineString: string): string {
        let result = LayaXShaderCompileCode.processFS(fs, defineString);
        result = LayaXShaderCompileUtil.ensureVersion(result);
        return result;
    }

    /**
     * Replace GLES 2.0 texture functions with GLES 3.0 equivalents.
     * The LayaX pipeline targets GLSL ES 3.0+, so legacy functions need updating.
     * This is a safety net — `GLSLCodeGenerator` should already handle this via
     * `#define texture2D texture` macros.
     */
    static upgradeTextureCalls(source: string): string {
        // Only apply if source uses #version 300 es or higher
        if (source.indexOf("#version 300 es") < 0 && source.indexOf("#version 310 es") < 0) {
            return source;
        }
        // Replace remaining legacy calls that weren't caught by #define macros
        let result = source;
        result = result.replace(/\btexture2DLodEXT\b/g, 'textureLod');
        result = result.replace(/\btexture2DProjLodEXT\b/g, 'textureProjLod');
        result = result.replace(/\btextureCubeLodEXT\b/g, 'textureLod');
        result = result.replace(/\btexture2DGradEXT\b/g, 'textureGrad');
        result = result.replace(/\btexture2DProjGradEXT\b/g, 'textureProjGrad');
        result = result.replace(/\btextureCubeGradEXT\b/g, 'textureGrad');
        return result;
    }

    /**
     * Remove GLSL extension directives that are not needed for the wgpu pipeline.
     * Extensions like GL_EXT_shader_texture_lod are WebGL-specific.
     */
    static removeUnsupportedExtensions(source: string): string {
        // Remove #extension lines for WebGL-specific extensions
        return source.replace(
            /^\s*#\s*extension\s+(GL_EXT_shader_texture_lod|GL_OES_standard_derivatives)\s*:\s*\w+\s*$/gm,
            ''
        );
    }

    /**
     * Full processing pipeline for a shader source string destined for the Rust backend.
     * Applies all necessary transformations in order.
     *
     * @param source The GLSL source (already processed by GLSLCodeGenerator)
     * @param isVertex Whether this is a vertex shader
     * @returns GLSL source ready for the native LayaX compiler
     */
    static prepareForNative(source: string, isVertex: boolean): string {
        let result = source;
        result = LayaXShaderCompileUtil.ensureVersion(result);
        result = LayaXShaderCompileUtil.removeUnsupportedExtensions(result);
        result = LayaXShaderCompileUtil.upgradeTextureCalls(result);
        return result;
    }
}
