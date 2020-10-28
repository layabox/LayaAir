import { WebGLContext } from "../WebGLContext"

//export type BlendFunc = (gl:WebGLRenderingContext)=>void

export class BlendMode {
    static activeBlendFunction: Function = null;
    /** @internal 这个不直接暴露给开发者*/
    static NAMES = [
        "normal", 
        "add", 
        "multiply", 
        "screen", 
        "overlay", 
        "light", 
        "mask", 
        "destination-out",
        "add_old"];

    /** @internal */
    static TOINT:{[key:string]:number} = { 
        "normal": 0, 
        "add": 1, 
        "multiply": 2, 
        "screen": 3, 
        "overlay": 4, 
        "light": 5, 
        "mask": 6, 
        "destination-out": 7, 
        "lighter": 1,
        "lighter_old": 8,
        "add_old":8};

    static      NORMAL = "normal";					//0
    static        MASK = "mask";					//6
    static     LIGHTER = "lighter";					//1  

    static fns: any[];
    static targetFns: any[];
    /**@internal */
    static _init_(gl: WebGLContext): void {
        BlendMode.fns =       [
            BlendMode.BlendNormal,      //0
            BlendMode.BlendAdd,         //1
            BlendMode.BlendMultiply,    //2
            BlendMode.BlendScreen,      //3
            BlendMode.BlendOverlay,     //4
            BlendMode.BlendLight,       //5
            BlendMode.BlendMask,        //6
            BlendMode.BlendDestinationOut,   //7
            BlendMode.BlendAddOld         //8
        ];

        BlendMode.targetFns = [
            BlendMode.BlendNormalTarget,    //0
            BlendMode.BlendAddTarget,       //1
            BlendMode.BlendMultiplyTarget,  //2
            BlendMode.BlendScreenTarget,    //3
            BlendMode.BlendOverlayTarget,   //4
            BlendMode.BlendLightTarget,     //5
            BlendMode.BlendMask,            //6
            BlendMode.BlendDestinationOut,  //7
            BlendMode.BlendAddTargetOld     //8
        ];
    }

    static BlendNormal(gl: WebGLRenderingContext): void {
        //为了避免黑边，和canvas作为贴图的黑边
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA,true);
    }

    /**@internal 这个add感觉不合理，所以改成old了 */
    static BlendAddOld(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA,true);
    }

    static BlendAdd(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
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

    /**@internal add不应该是1+dst_α 所以改成old */
    static BlendAddTargetOld(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA,true);
    }
    static BlendAddTarget(gl: WebGLRenderingContext): void {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE,true);
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

