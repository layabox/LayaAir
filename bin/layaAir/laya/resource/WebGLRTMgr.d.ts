import { RenderTexture2D } from "./RenderTexture2D";
/**
 * WebGLRTMgr 管理WebGLRenderTarget的创建和回收
 */
export declare class WebGLRTMgr {
    private static dict;
    /**
     * 获得一个renderTarget
     * 暂时先按照严格大小判断。
     *
     * @param	w
     * @param	h
     * @return
     */
    static getRT(w: number, h: number): RenderTexture2D;
    /**
     * 回收一个renderTarget
     * @param	rt
     */
    static releaseRT(rt: RenderTexture2D): void;
}
