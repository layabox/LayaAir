import { WebGLContext } from "../WebGLContext"

export type BlendFunc = (gl:WebGLRenderingContext)=>void

export class BlendMode {
    static activeBlendFunction: BlendFunc = null;
    static NAMES = ["normal", "add", "multiply", "screen", "overlay", "light", "mask", "destination-out"];
    static TOINT:{[key:string]:number} = { "normal": 0, "add": 1, "multiply": 2, "screen": 3, "overlay": 4, "light": 5, "mask": 6, "destination-out": 7, "lighter": 1 };

    static NORMAL = "normal";					//0
    static ADD = "add";							//1
    static MULTIPLY = "multiply";				//2
    static SCREEN = "screen";					//3
    static OVERLAY = "overlay";					//4
    static LIGHT = "light";						//5
    static MASK = "mask";						//6
    static DESTINATIONOUT = "destination-out";	//7
    static LIGHTER = "lighter";					//1  等同于加色法

    static fns: BlendFunc[];
    static targetFns: BlendFunc[];
    /**@internal */
    static _init_(gl: WebGLContext): void {
        BlendMode.fns = [BlendMode.BlendNormal, BlendMode.BlendAdd, BlendMode.BlendMultiply, BlendMode.BlendScreen, BlendMode.BlendOverlay, BlendMode.BlendLight, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
        BlendMode.targetFns = [BlendMode.BlendNormalTarget, BlendMode.BlendAddTarget, BlendMode.BlendMultiplyTarget, BlendMode.BlendScreenTarget, BlendMode.BlendOverlayTarget, BlendMode.BlendLightTarget, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
    }

    static BlendNormal(gl: WebGLRenderingContext): void {
        //为了避免黑边，和canvas作为贴图的黑边
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA,true);
    }

    static BlendAdd(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA,true);
    }

    static BlendMultiply(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA,true);
    }

    static BlendScreen(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
    }

    static BlendOverlay(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR,true);
    }

    static BlendLight(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
    }

    static BlendNormalTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA,true);
    }

    static BlendAddTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA,true);
    }

    static BlendMultiplyTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA,true);
    }

    static BlendScreenTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
    }

    static BlendOverlayTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR,true);
    }

    static BlendLightTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
    }

    static BlendMask(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ZERO, gl.SRC_ALPHA,true);
    }

    static BlendDestinationOut(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ZERO, gl.ZERO,true);
    }
}

