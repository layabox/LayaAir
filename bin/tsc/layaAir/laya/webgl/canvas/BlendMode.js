import { WebGLContext } from "../WebGLContext";
export class BlendMode {
    /**@internal */
    static _init_(gl) {
        BlendMode.fns = [BlendMode.BlendNormal, BlendMode.BlendAdd, BlendMode.BlendMultiply, BlendMode.BlendScreen, BlendMode.BlendOverlay, BlendMode.BlendLight, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
        BlendMode.targetFns = [BlendMode.BlendNormalTarget, BlendMode.BlendAddTarget, BlendMode.BlendMultiplyTarget, BlendMode.BlendScreenTarget, BlendMode.BlendOverlayTarget, BlendMode.BlendLightTarget, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
    }
    static BlendNormal(gl) {
        //为了避免黑边，和canvas作为贴图的黑边
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
    }
    static BlendAdd(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.DST_ALPHA);
    }
    //TODO:coverage
    static BlendMultiply(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
    }
    //TODO:coverage
    static BlendScreen(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
    }
    //TODO:coverage
    static BlendOverlay(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_COLOR);
    }
    //TODO:coverage
    static BlendLight(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
    }
    static BlendNormalTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
    }
    //TODO:coverage
    static BlendAddTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.DST_ALPHA);
    }
    //TODO:coverage
    static BlendMultiplyTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
    }
    //TODO:coverage
    static BlendScreenTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
    }
    //TODO:coverage
    static BlendOverlayTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_COLOR);
    }
    //TODO:coverage
    static BlendLightTarget(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
    }
    static BlendMask(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ZERO, WebGL2RenderingContext.SRC_ALPHA);
    }
    //TODO:coverage
    static BlendDestinationOut(gl) {
        WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ZERO, WebGL2RenderingContext.ZERO);
    }
}
BlendMode.activeBlendFunction = null;
BlendMode.NAMES = ["normal", "add", "multiply", "screen", "overlay", "light", "mask", "destination-out"];
BlendMode.TOINT = { "normal": 0, "add": 1, "multiply": 2, "screen": 3, "overlay": 4, "light": 5, "mask": 6, "destination-out": 7, "lighter": 1 };
BlendMode.NORMAL = "normal"; //0
BlendMode.ADD = "add"; //1
BlendMode.MULTIPLY = "multiply"; //2
BlendMode.SCREEN = "screen"; //3
BlendMode.OVERLAY = "overlay"; //4
BlendMode.LIGHT = "light"; //5
BlendMode.MASK = "mask"; //6
BlendMode.DESTINATIONOUT = "destination-out"; //7
BlendMode.LIGHTER = "lighter"; //1  等同于加色法
BlendMode.fns = [];
BlendMode.targetFns = [];
