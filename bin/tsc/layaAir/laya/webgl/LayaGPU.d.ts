/**
 * @private
 */
export declare class LayaGPU {
    /**@private */
    private static _extentionVendorPrefixes;
    /**@private */
    private _gl;
    /**@private */
    private _vaoExt;
    /**@private */
    private _angleInstancedArrays;
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
