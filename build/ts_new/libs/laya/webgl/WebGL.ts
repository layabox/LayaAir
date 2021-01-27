import { RenderState2D } from "./utils/RenderState2D"
import { WebGLContext } from "./WebGLContext";

/**
 * @private
 */
export class WebGL {
    static _isWebGL2: boolean = false;
    static isNativeRender_enable: boolean = false;

    //TODO:coverage
    private static _uint8ArraySlice(): Uint8Array {
        var _this: any = this;
        var sz: number = _this.length;
        var dec: Uint8Array = new Uint8Array(_this.length);
        for (var i: number = 0; i < sz; i++) dec[i] = _this[i];
        return dec;
    }

    //TODO:coverage
    private static _float32ArraySlice(): Float32Array {
        var _this: any = this;
        var sz: number = _this.length;
        var dec: Float32Array = new Float32Array(_this.length);
        for (var i: number = 0; i < sz; i++) dec[i] = _this[i];
        return dec;
    }

    //TODO:coverage
    private static _uint16ArraySlice(...arg:any[]): Uint16Array {
        var _this: any = this;
        var sz: number;
        var dec: Uint16Array;
        var i: number;
        if (arg.length === 0) {
            sz = _this.length;
            dec = new Uint16Array(sz);
            for (i = 0; i < sz; i++)
                dec[i] = _this[i];

        } else if (arg.length === 2) {
            var start: number = arg[0];
            var end: number = arg[1];

            if (end > start) {
                sz = end - start;
                dec = new Uint16Array(sz);
                for (i = start; i < end; i++)
                    dec[i - start] = _this[i];
            } else {
                dec = new Uint16Array(0);
            }
        }
        return dec;
    }

    static _nativeRender_enable(): void {
    }

    //使用webgl渲染器
    static enable(): boolean {
        return true;
    }

    static inner_enable(): boolean {
        Float32Array.prototype.slice || (Float32Array.prototype.slice = WebGL._float32ArraySlice);
        Uint16Array.prototype.slice || (Uint16Array.prototype.slice = WebGL._uint16ArraySlice);
        Uint8Array.prototype.slice || (Uint8Array.prototype.slice = WebGL._uint8ArraySlice);
        return true;
    }

    static onStageResize(width: number, height: number): void {
        if (WebGLContext.mainContext == null) return;
        WebGLContext.mainContext.viewport(0, 0, width, height);
        RenderState2D.width = width;
        RenderState2D.height = height;
    }
}



