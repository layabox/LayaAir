import { WebGL } from "../webgl/WebGL"


/**
 * @private
 */
export class RunDriver {

    /**
     * 用于改变 WebGL宽高信息。
     */
    static changeWebGLSize: Function = function (w: number, h: number): void {
        WebGL.onStageResize(w, h);
    }
}


