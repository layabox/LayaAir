
import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { VertexArrayObject } from "../../laya/webgl/VertexArrayObject";
import { SystemUtils } from "./SystemUtils";

/**
 * @internal
 */
export class LayaGPU {
    /**@internal */
    private static _extentionVendorPrefixes: any[] = ["", "WEBKIT_", "MOZ_"];

    /**@internal */
    private _gl: any = null;
    /**@internal */
    private _vaoExt: any = null;
    /**@internal */
    private _angleInstancedArrays: any = null;

    /**@internal */
    _isWebGL2: boolean = false;
    /**@internal */
    _oesTextureHalfFloat: any = null;
    /**@internal */
    _oes_element_index_uint: any = null;
    /**@internal */
    _oesTextureHalfFloatLinear: any = null;
    /**@internal */
    _oesTextureFloat: any = null;
    /**@internal */
    _extShaderTextureLod: any = null;
    /**@internal */
    _extTextureFilterAnisotropic: any = null;
    /**@internal */
    _compressedTextureS3tc: any = null;
    /**@internal */
    _compressedTexturePvrtc: any = null;
    /**@internal */
    _compressedTextureEtc1: any = null;
    /**@internal */
    _compressedTextureETC:any = null;
    /**@internal */
    _compressedTextureASTC:any = null;
    /**@internal */
    _webgl_depth_texture: any = null;
    /**@internal webgl1.0开启OES_texture_half_float_linear会默认开启这个扩展*/
    _extColorBufferFloat:any = null;

    /**
     * @internal
     */
    constructor(gl: WebGLRenderingContext, isWebGL2: boolean) {
        this._gl = gl;
        this._isWebGL2 = isWebGL2;
        var maxTextureFS: number = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        var maxTextureSize: number = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (!isWebGL2) {
            if (!ILaya.Render.isConchApp) {
                VertexArrayObject;//强制引用
                if ((window as any)._setupVertexArrayObject) //兼容VAO
                    (window as any)._setupVertexArrayObject(gl);
            }
            this._vaoExt = this._getExtension("OES_vertex_array_object");
            this._angleInstancedArrays = this._getExtension("ANGLE_instanced_arrays");

            this._oesTextureHalfFloat = this._getExtension("OES_texture_half_float");
            this._oesTextureHalfFloatLinear = this._getExtension("OES_texture_half_float_linear");
            this._oesTextureFloat = this._getExtension("OES_texture_float");
            //this._getExtension("OES_texture_float_linear");
            this._oes_element_index_uint = this._getExtension("OES_element_index_uint");
            this._extShaderTextureLod = this._getExtension("EXT_shader_texture_lod");
            this._webgl_depth_texture = this._getExtension("WEBGL_depth_texture");

            SystemUtils._shaderCapailityLevel = 30;
        } else {
            this._extColorBufferFloat = this._getExtension("EXT_color_buffer_float");
            //this._getExtension("OES_texture_float_linear");
            SystemUtils._shaderCapailityLevel = 35;
        }

        //_getExtension("EXT_float_blend");
        this._extTextureFilterAnisotropic = this._getExtension("EXT_texture_filter_anisotropic");
        this._compressedTextureS3tc = this._getExtension("WEBGL_compressed_texture_s3tc");
        this._compressedTexturePvrtc = this._getExtension("WEBGL_compressed_texture_pvrtc");
        this._compressedTextureEtc1 = this._getExtension("WEBGL_compressed_texture_etc1");
        this._compressedTextureETC = this._getExtension("WEBGL_compressed_texture_etc");
        this._compressedTextureASTC = this._getExtension("WEBGL_compressed_texture_astc");
        SystemUtils._maxTextureCount = maxTextureFS;
        SystemUtils._maxTextureSize = maxTextureSize;
    }

    /**
     * @internal
     */
    private _getExtension(name: string): any {
        var prefixes: any[] = LayaGPU._extentionVendorPrefixes;
        for (var k in prefixes) {
            var ext: any = this._gl.getExtension(prefixes[k] + name);
            if (ext)
                return ext;
        }
        return null;
    }

    /**
     * @internal
     */
    createVertexArray(): any {
        if (this._isWebGL2)
            return this._gl.createVertexArray();
        else
            return this._vaoExt.createVertexArrayOES();
    }

    /**
     * @internal
     */
    bindVertexArray(vertexArray: any): void {
        if (this._isWebGL2)
            this._gl.bindVertexArray(vertexArray);
        else
            this._vaoExt.bindVertexArrayOES(vertexArray);
    }

    /**
     * @internal
     */
    deleteVertexArray(vertexArray: any): void {
        if (this._isWebGL2)
            this._gl.deleteVertexArray(vertexArray);
        else
            this._vaoExt.deleteVertexArrayOES(vertexArray);
    }

    /**
     * @internal
     */
    isVertexArray(vertexArray: any): void {
        if (this._isWebGL2)
            this._gl.isVertexArray(vertexArray);
        else
            this._vaoExt.isVertexArrayOES(vertexArray);
    }


    /**
     * @internal
     */
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void {
        if (this._isWebGL2)
            this._gl.drawElementsInstanced(mode, count, type, offset, instanceCount);
        else
            this._angleInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
    }

    /**
     * @internal
     */
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void {
        if (this._isWebGL2)
            this._gl.drawArraysInstanced(mode, first, count, instanceCount);
        else
            this._angleInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
    }

    /**
     * @internal
     */
    vertexAttribDivisor(index: number, divisor: number): void {
        if (this._isWebGL2)
            this._gl.vertexAttribDivisor(index, divisor);
        else
            this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
    }

    /**
     * @internal
     */
    supportInstance(): boolean {
        if ((this._isWebGL2 || this._angleInstancedArrays) && Config.allowGPUInstanceDynamicBatch)
            return true;
        else
            return false;
    }

    /**
    * @internal
    */
    supportElementIndexUint32(): boolean {
        return this._isWebGL2 || this._oes_element_index_uint ? true : false;
    }

}


