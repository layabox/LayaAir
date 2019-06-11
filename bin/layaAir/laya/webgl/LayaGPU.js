import { WebGLContext } from "./WebGLContext";
import { WebGL } from "./WebGL";
import { ILaya } from "ILaya";
import { VertexArrayObject } from "laya/webgl/VertexArrayObject";
/**
 * @private
 */
export class LayaGPU {
    /**
     * @private
     */
    constructor(gl, isWebGL2) {
        /**@private */
        this._gl = null;
        /**@private */
        this._vaoExt = null;
        /**@private */
        this._angleInstancedArrays = null;
        /**@private */
        this._isWebGL2 = false;
        /**@private */
        this._oesTextureHalfFloat = null;
        /**@private */
        this._extTextureFilterAnisotropic = null;
        /**@private */
        this._compressedTextureS3tc = null;
        /**@private */
        this._compressedTexturePvrtc = null;
        /**@private */
        this._compressedTextureEtc1 = null;
        this._gl = gl;
        this._isWebGL2 = isWebGL2;
        try { //某些浏览器中未实现此函数，使用try catch增强兼容性。
            var precisionFormat = gl.getShaderPrecisionFormat(WebGLContext.FRAGMENT_SHADER, WebGLContext.HIGH_FLOAT);
            precisionFormat.precision ? (WebGL.shaderHighPrecision = true) : WebGL.shaderHighPrecision = false;
        }
        catch (e) {
        }
        if (!isWebGL2) {
            var forceVAO = LayaGPU._forceSupportVAOPlatform();
            if (!ILaya.Render.isConchApp) {
                VertexArrayObject; //强制引用
                if (window._setupVertexArrayObject) { //兼容VAO
                    if (forceVAO)
                        window._forceSetupVertexArrayObject(gl);
                    else
                        window._setupVertexArrayObject(gl);
                }
            }
            this._vaoExt = this._getExtension("OES_vertex_array_object");
            if (!forceVAO)
                this._angleInstancedArrays = this._getExtension("ANGLE_instanced_arrays"); //forceVAO会导致Instance有BUG
            this._oesTextureHalfFloat = this._getExtension("OES_texture_half_float");
            this._getExtension("OES_texture_half_float_linear");
            //_getExtension("OES_texture_float");
            //_getExtension("OES_texture_float_linear");
        }
        else {
            this._getExtension("EXT_color_buffer_float");
            //_getExtension("OES_texture_float_linear");
        }
        //_getExtension("EXT_float_blend");
        this._extTextureFilterAnisotropic = this._getExtension("EXT_texture_filter_anisotropic");
        this._compressedTextureS3tc = this._getExtension("WEBGL_compressed_texture_s3tc");
        this._compressedTexturePvrtc = this._getExtension("WEBGL_compressed_texture_pvrtc");
        this._compressedTextureEtc1 = this._getExtension("WEBGL_compressed_texture_etc1");
    }
    /**
     * @private
     */
    static _forceSupportVAOPlatform() {
        let Browser = ILaya.Browser;
        return (Browser.onMiniGame && Browser.onIOS) || Browser.onBDMiniGame || Browser.onQGMiniGame;
    }
    /**
     * @private
     */
    _getExtension(name) {
        var prefixes = LayaGPU._extentionVendorPrefixes;
        for (var k in prefixes) {
            var ext = this._gl.getExtension(prefixes[k] + name);
            if (ext)
                return ext;
        }
        return null;
    }
    /**
     * @private
     */
    createVertexArray() {
        if (this._isWebGL2)
            return this._gl.createVertexArray();
        else
            return this._vaoExt.createVertexArrayOES();
    }
    /**
     * @private
     */
    bindVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.bindVertexArray(vertexArray);
        else
            this._vaoExt.bindVertexArrayOES(vertexArray);
    }
    /**
     * @private
     */
    deleteVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.deleteVertexArray(vertexArray);
        else
            this._vaoExt.deleteVertexArrayOES(vertexArray);
    }
    /**
     * @private
     */
    isVertexArray(vertexArray) {
        if (this._isWebGL2)
            this._gl.isVertexArray(vertexArray);
        else
            this._vaoExt.isVertexArrayOES(vertexArray);
    }
    /**
     * @private
     */
    drawElementsInstanced(mode, count, type, offset, instanceCount) {
        if (this._isWebGL2)
            this._gl.drawElementsInstanced(mode, count, type, offset, instanceCount);
        else
            this._angleInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
    }
    /**
     * @private
     */
    drawArraysInstanced(mode, first, count, instanceCount) {
        if (this._isWebGL2)
            this._gl.drawArraysInstanced(mode, first, count, instanceCount);
        else
            this._angleInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
    }
    /**
     * @private
     */
    vertexAttribDivisor(index, divisor) {
        if (this._isWebGL2)
            this._gl.vertexAttribDivisor(index, divisor);
        else
            this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
    }
    /**
     * @private
     */
    supportInstance() {
        if (this._isWebGL2 || this._angleInstancedArrays)
            return true;
        else
            return false;
    }
}
/**@private */
LayaGPU._extentionVendorPrefixes = ["", "WEBKIT_", "MOZ_"];
