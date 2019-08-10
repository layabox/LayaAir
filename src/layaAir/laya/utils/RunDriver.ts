import { WebGL } from "../webgl/WebGL"


/**
 * @private
 */
export class RunDriver {
    //TODO:coverage
    static createShaderCondition: Function = function (conditionScript: string): Function {
        var fn: string = "(function() {return " + conditionScript + ";})";
        return (window as any).Laya._runScript(fn);//生成条件判断函数
    }


    /**
     * 用于改变 WebGL宽高信息。
     */
    static changeWebGLSize: Function = function (w: number, h: number): void {
        WebGL.onStageResize(w, h);
    }
}


