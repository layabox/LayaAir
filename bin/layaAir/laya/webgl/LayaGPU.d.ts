/**
 * @private
 */
export declare class LayaGPU {
    /**@private */
    private static _extentionVendorPrefixes;
    /**
     * @private
     */
    static _forceSupportVAOPlatform(): boolean;
    /**@private */
    private _gl;
    /**@private */
    private _vaoExt;
    /**@private */
    private _angleInstancedArrays;
    /**@private */
    _isWebGL2: boolean;
    /**@private */
    _oesTextureHalfFloat: any;
    /**@private */
    _extTextureFilterAnisotropic: any;
    /**@private */
    _compressedTextureS3tc: any;
    /**@private */
    _compressedTexturePvrtc: any;
    /**@private */
    _compressedTextureEtc1: any;
    /**
     * @private
     */
    constructor(gl: any, isWebGL2: boolean);
    /**
     * @private
     */
    private _getExtension;
    /**
     * @private
     */
    createVertexArray(): any;
    /**
     * @private
     */
    bindVertexArray(vertexArray: any): void;
    /**
     * @private
     */
    deleteVertexArray(vertexArray: any): void;
    /**
     * @private
     */
    isVertexArray(vertexArray: any): void;
    /**
     * @private
     */
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;
    /**
     * @private
     */
    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;
    /**
     * @private
     */
    vertexAttribDivisor(index: number, divisor: number): void;
    /**
     * @private
     */
    supportInstance(): boolean;
}
