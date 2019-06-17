/**
 * @private
 */
export declare class WebGL {
    static shaderHighPrecision: boolean;
    static _isWebGL2: boolean;
    static isNativeRender_enable: boolean;
    private static _uint8ArraySlice;
    private static _float32ArraySlice;
    private static _uint16ArraySlice;
    static _nativeRender_enable(): void;
    static enable(): boolean;
    static inner_enable(): boolean;
    static onStageResize(width: number, height: number): void;
}
