
import { ILaya } from "../../ILaya";
import { VertexArrayObject } from "../../laya/webgl/VertexArrayObject";

/**
 * @internal
 */
export class LayaGPU {
    /**@internal */
    private static _extentionVendorPrefixes: any[] = ["", "WEBKIT_", "MOZ_"];

    /**
     * @internal
     */
    static _forceSupportVAOPlatform(): boolean {
        let Browser = ILaya.Browser;
        return Browser.onBDMiniGame || Browser.onQGMiniGame;
    }

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
    _extTextureFilterAnisotropic: any = null;
    /**@internal */
    _compressedTextureS3tc: any = null;
    /**@internal */
    _compressedTexturePvrtc: any = null;
    /**@internal */
    _compressedTextureEtc1: any = null;

    /**
     * @internal
     */
    constructor(gl: any, isWebGL2: boolean) {
        this._gl = gl;
        this._isWebGL2 = isWebGL2;

        if (!isWebGL2) {
            var forceVAO: boolean = LayaGPU._forceSupportVAOPlatform();
            if (!ILaya.Render.isConchApp) {
                VertexArrayObject;//强制引用
                if ((window as any)._setupVertexArrayObject) {//兼容VAO
                    if (forceVAO)
                        (window as any)._forceSetupVertexArrayObject(gl);
                    else
                        (window as any)._setupVertexArrayObject(gl);
                }
            }
            this._vaoExt = this._getExtension("OES_vertex_array_object");
            if (!forceVAO)
                this._angleInstancedArrays = this._getExtension("ANGLE_instanced_arrays");//forceVAO会导致Instance有BUG

            this._oesTextureHalfFloat = this._getExtension("OES_texture_half_float");
            this._oesTextureHalfFloatLinear = this._getExtension("OES_texture_half_float_linear");
            this._oesTextureFloat = this._getExtension("OES_texture_float");
            //this._getExtension("OES_texture_float_linear");
            this._oes_element_index_uint = this._getExtension("OES_element_index_uint");
        } else {
            this._getExtension("EXT_color_buffer_float");
            //this._getExtension("OES_texture_float_linear");
        }

        //_getExtension("EXT_float_blend");
        this._extTextureFilterAnisotropic = this._getExtension("EXT_texture_filter_anisotropic");
        this._compressedTextureS3tc = this._getExtension("WEBGL_compressed_texture_s3tc");
        this._compressedTexturePvrtc = this._getExtension("WEBGL_compressed_texture_pvrtc");
        this._compressedTextureEtc1 = this._getExtension("WEBGL_compressed_texture_etc1");
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
        if (this._isWebGL2 || this._angleInstancedArrays)
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


