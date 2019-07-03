/// <reference types="webgl2" />
export declare class BlendMode {
    static activeBlendFunction: Function;
    static NAMES: any[];
    static TOINT: any;
    static NORMAL: string;
    static ADD: string;
    static MULTIPLY: string;
    static SCREEN: string;
    static OVERLAY: string;
    static LIGHT: string;
    static MASK: string;
    static DESTINATIONOUT: string;
    static LIGHTER: string;
    static fns: any[];
    static targetFns: any[];
    static BlendNormal(gl: WebGL2RenderingContext): void;
    static BlendAdd(gl: WebGL2RenderingContext): void;
    static BlendMultiply(gl: WebGL2RenderingContext): void;
    static BlendScreen(gl: WebGL2RenderingContext): void;
    static BlendOverlay(gl: WebGL2RenderingContext): void;
    static BlendLight(gl: WebGL2RenderingContext): void;
    static BlendNormalTarget(gl: WebGL2RenderingContext): void;
    static BlendAddTarget(gl: WebGL2RenderingContext): void;
    static BlendMultiplyTarget(gl: WebGL2RenderingContext): void;
    static BlendScreenTarget(gl: WebGL2RenderingContext): void;
    static BlendOverlayTarget(gl: WebGL2RenderingContext): void;
    static BlendLightTarget(gl: WebGL2RenderingContext): void;
    static BlendMask(gl: WebGL2RenderingContext): void;
    static BlendDestinationOut(gl: WebGL2RenderingContext): void;
}
