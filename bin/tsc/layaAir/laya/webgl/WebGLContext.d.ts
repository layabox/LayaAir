/// <reference types="webgl2" />
export declare class WebGLContext {
    /**@private */
    static mainContext: WebGL2RenderingContext;
    /**
     * @private
     */
    static useProgram(gl: WebGL2RenderingContext, program: any): boolean;
    /**
     * @private
     */
    static setDepthTest(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthMask(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthFunc(gl: WebGL2RenderingContext, value: number): void;
    /**
     * @private
     */
    static setBlend(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setBlendFunc(gl: WebGL2RenderingContext, sFactor: number, dFactor: number): void;
    /**
     * @private
     */
    static setBlendFuncSeperate(gl: WebGL2RenderingContext, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;
    /**
     * @private
     */
    static setCullFace(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setFrontFace(gl: WebGL2RenderingContext, value: number): void;
    /**
     * @private
     */
    static activeTexture(gl: WebGL2RenderingContext, textureID: number): void;
    /**
     * @private
     */
    static bindTexture(gl: WebGL2RenderingContext, target: any, texture: any): void;
    /**
     * @private
     */
    static __init_native(): void;
    /**
     * @private
     */
    static useProgramForNative(gl: WebGL2RenderingContext, program: any): boolean;
    /**
     * @private
     */
    static setDepthTestForNative(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthMaskForNative(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthFuncForNative(gl: WebGL2RenderingContext, value: number): void;
    /**
     * @private
     */
    static setBlendForNative(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setBlendFuncForNative(gl: WebGL2RenderingContext, sFactor: number, dFactor: number): void;
    /**
     * @private
     */
    static setCullFaceForNative(gl: WebGL2RenderingContext, value: boolean): void;
    /**
     * @private
     */
    static setFrontFaceForNative(gl: WebGL2RenderingContext, value: number): void;
    /**
     * @private
     */
    static activeTextureForNative(gl: WebGL2RenderingContext, textureID: number): void;
    /**
     * @private
     */
    static bindTextureForNative(gl: WebGL2RenderingContext, target: any, texture: any): void;
    /**
     * @private
     */
    static bindVertexArrayForNative(gl: WebGLContext, vertexArray: any): void;
}
