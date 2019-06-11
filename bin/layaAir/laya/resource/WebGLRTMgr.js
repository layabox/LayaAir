import { BaseTexture } from "./BaseTexture";
import { RenderTexture2D } from "./RenderTexture2D";
/**
 * WebGLRTMgr 管理WebGLRenderTarget的创建和回收
 */
export class WebGLRTMgr {
    /**
     * 获得一个renderTarget
     * 暂时先按照严格大小判断。
     *
     * @param	w
     * @param	h
     * @return
     */
    static getRT(w, h) {
        w = w | 0;
        h = h | 0;
        if (w >= 10000) {
            console.error('getRT error! w too big');
        }
        var key = h * 10000 + w;
        var sw = WebGLRTMgr.dict[key];
        var ret;
        if (sw) {
            if (sw.length > 0) {
                ret = sw.pop();
                ret._mgrKey = key; //只有不再mgr中的才有key
                return ret;
            }
        }
        ret = new RenderTexture2D(w, h, BaseTexture.FORMAT_R8G8B8A8, -1);
        ret._mgrKey = key;
        return ret;
    }
    /**
     * 回收一个renderTarget
     * @param	rt
     */
    static releaseRT(rt) {
        //如果_mgrKey<=0表示已经加进来了。
        if (rt._mgrKey <= 0)
            return;
        var sw = WebGLRTMgr.dict[rt._mgrKey];
        !sw && (sw = [], WebGLRTMgr.dict[rt._mgrKey] = sw);
        rt._mgrKey = 0;
        sw.push(rt);
    }
}
/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
WebGLRTMgr.dict = {}; //key=h*10000+w
