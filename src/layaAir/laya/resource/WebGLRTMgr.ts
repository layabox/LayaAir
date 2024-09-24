import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture2D } from "./RenderTexture2D";

/**
 * @en WebGLRTMgr is a manager for creating and recycling WebGLRenderTarget.
 * TODO The demand is not high and the management cost is high. Remove it first.
 * @zh WebGLRTMgr 管理WebGLRenderTarget的创建和回收
 * TODO 需求不大，管理成本高。先去掉。
 */
export class WebGLRTMgr {

	private static dict: any = {};		//key=h*10000+w

    /**
     * @en Retrieves a render target with the specified width and height. For now, the search is based strictly on size.
     * @param w The width of the render target.
     * @param h The height of the render target.
     * @returns A RenderTexture2D instance.
	 * @zh 根据指定的宽度和高度获得一个渲染目标。目前，搜索是基于严格大小判断的。
	 * @param w 渲染目标的宽度。
	 * @param h 渲染目标的高度。
	 * @returns RenderTexture2D实例。
     */
	static getRT(w: number, h: number): RenderTexture2D {
		w = w | 0;
		h = h | 0;
		if (w >= 10000) {
			console.error('getRT error! w too big');
		}
		var ret: RenderTexture2D;
		/*
		var key: number = h * 10000 + w;
		var sw: any[] = WebGLRTMgr.dict[key];
		if (sw) {
			if (sw.length > 0) {
				ret = sw.pop();
				ret._mgrKey = key;	//只有不再mgr中的才有key
				return ret;
			}
		}
		*/
		ret = new RenderTexture2D(w, h, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
		//ret._mgrKey = key;
		return ret;
	}


    /**
     * @en Releases a render target back to the manager for recycling.
     * @param rt The RenderTexture2D instance to be recycled.
	 * @zh 将渲染目标回收至管理器以供循环使用。
	 * @param rt 要回收的渲染目标。
     */
	static releaseRT(rt: RenderTexture2D): void {
		rt.destroy();
		//rt._disposeResource();// 直接删除贴图。否则还要管理占用过多的时候的清理。  修改：去掉了，直接destroy，否则统计会以为没有释放掉。
		return;
		/*
		//如果_mgrKey<=0表示已经加进来了。
		if (rt._mgrKey <= 0)
			return;
		var sw: any[] = WebGLRTMgr.dict[rt._mgrKey];
		!sw && (sw = [], WebGLRTMgr.dict[rt._mgrKey] = sw);
		rt._mgrKey = 0;
		sw.push(rt);
		*/
	}
}

