import { RenderTexture2D } from "./RenderTexture2D";
import { RenderTextureFormat } from "./RenderTextureFormat";

/**
 * WebGLRTMgr 管理WebGLRenderTarget的创建和回收
 * TODO 需求不大，管理成本高。先去掉。
 */

export class WebGLRTMgr {

	private static dict: any = {};		//key=h*10000+w
	/**
	 * 获得一个renderTarget
	 * 暂时先按照严格大小判断。
	 * 
	 * @param	w
	 * @param	h
	 * @return
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
		ret = new RenderTexture2D(w, h, RenderTextureFormat.R8G8B8A8, -1);
		//ret._mgrKey = key;
		return ret;
	}


	/**
	 * 回收一个renderTarget
	 * @param	rt
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

