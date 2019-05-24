import { WebGL } from "../webgl/WebGL";
/**
 * @private
 */
export class RunDriver {
}
//TODO:coverage
RunDriver.createShaderCondition = function (conditionScript) {
    var fn = "(function() {return " + conditionScript + ";})";
    return window.Laya._runScript(fn); //生成条件判断函数
};
/**
 * 用于改变 WebGL宽高信息。
 */
RunDriver.changeWebGLSize = function (w, h) {
    WebGL.onStageResize(w, h);
};
