import { RenderState2D } from "./utils/RenderState2D";
import { WebGLContext } from "./WebGLContext";
/**
 * @private
 */
export class WebGL {
    //TODO:coverage
    static _uint8ArraySlice() {
        var _this = this;
        var sz = _this.length;
        var dec = new Uint8Array(_this.length);
        for (var i = 0; i < sz; i++)
            dec[i] = _this[i];
        return dec;
    }
    //TODO:coverage
    static _float32ArraySlice() {
        var _this = this;
        var sz = _this.length;
        var dec = new Float32Array(_this.length);
        for (var i = 0; i < sz; i++)
            dec[i] = _this[i];
        return dec;
    }
    //TODO:coverage
    static _uint16ArraySlice(...arg) {
        var _this = this;
        var sz;
        var dec;
        var i;
        if (arg.length === 0) {
            sz = _this.length;
            dec = new Uint16Array(sz);
            for (i = 0; i < sz; i++)
                dec[i] = _this[i];
        }
        else if (arg.length === 2) {
            var start = arg[0];
            var end = arg[1];
            if (end > start) {
                sz = end - start;
                dec = new Uint16Array(sz);
                for (i = start; i < end; i++)
                    dec[i - start] = _this[i];
            }
            else {
                dec = new Uint16Array(0);
            }
        }
        return dec;
    }
    static _nativeRender_enable() {
    }
    //使用webgl渲染器
    static enable() {
        return true;
    }
    static inner_enable() {
        Float32Array.prototype.slice || (Float32Array.prototype.slice = WebGL._float32ArraySlice);
        Uint16Array.prototype.slice || (Uint16Array.prototype.slice = WebGL._uint16ArraySlice);
        Uint8Array.prototype.slice || (Uint8Array.prototype.slice = WebGL._uint8ArraySlice);
        return true;
    }
    static onStageResize(width, height) {
        if (WebGLContext.mainContext == null)
            return;
        WebGLContext.mainContext.viewport(0, 0, width, height);
        RenderState2D.width = width;
        RenderState2D.height = height;
    }
}
WebGL._isWebGL2 = false;
WebGL.isNativeRender_enable = false;
