import { WebGPURenderContext3D } from "../../3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "./WebGPURenderBundle";

/**
 * 渲染指令缓存管理器
 */
export class WebGPURenderBundleManager {
    elementsMaxPerBundle: number = 50; //每个Bundle最大元素数量
    lowShotRate: number = 0.75; //低命中率移除阈值
    bundles: WebGPURenderBundle[] = []; //所有bundle
    private _elementsMap: Map<number, WebGPURenderBundle> = new Map(); //包含的渲染节点id集合
    private _renderBundles: GPURenderBundle[] = []; //渲染命令缓存对象
    private _needUpdateRenderBundles: boolean = false; //是否需要更新渲染命令缓存对象

    /**
     * 渲染所有bundle
     * @param passEncoder 
     */
    renderBundles(passEncoder: GPURenderPassEncoder) {
        const rbs = this._renderBundles;
        if (this._needUpdateRenderBundles) {
            rbs.length = 0;
            for (let i = 0, len = this.bundles.length; i < len; i++)
                rbs.push(this.bundles[i].renderBundle);
            this._needUpdateRenderBundles = false;
        }
        passEncoder.executeBundles(rbs);
        //console.log('renderBundle =', bundles.length);
    }

    /**
     * 渲染元素是否在bundle中
     * @param elementId 
     */
    has(elementId: number) {
        const bundle = this._elementsMap.get(elementId);
        if (bundle) {
            bundle.addShot(); //命中
            return true;
        }
        return false;
    }

    /**
     * 根据渲染元素id查找bundle
     * @param elementId 
     */
    getBundle(elementId: number) {
        for (let i = this.bundles.length - 1; i > -1; i--)
            if (this.bundles[i].hasElement(elementId))
                return this.bundles[i]; //命中
        return null;
    }

    /**
     * 通过渲染元素组创建bundle
     * @param context 
     * @param elements 
     */
    createBundle(context: WebGPURenderContext3D, elements: WebGPURenderElement3D[]) {
        const bundle = new WebGPURenderBundle(context.device, context.destRT);
        for (let i = 0, len = elements.length; i < len; i++) {
            bundle.render(context, elements[i]);
            this._elementsMap.set(elements[i].bundleId, bundle);
        }
        bundle.finish();
        this.bundles.push(bundle);
        this._needUpdateRenderBundles = true;
        //console.log('createBundle =', this.bundles.length - 1, bundle);
    }

    /**
     * 移除bundle
     * @param bundle 
     */
    removeBundle(bundle: WebGPURenderBundle) {
        const idx = this.bundles.indexOf(bundle);
        if (idx !== -1) {
            this.bundles[idx].removeMyIds(this._elementsMap);
            this.bundles.splice(idx, 1);
            this._needUpdateRenderBundles = true;
        }
    }

    /**
     * 通过指定元素id移除bundle
     * @param elementId 
     */
    removeBundleByElement(elementId: number) {
        const bundle = this.getBundle(elementId);
        if (bundle)
            this.removeBundle(bundle);
    }

    /**
     * 清除所有bundle
     */
    clearBundle() {
        this.bundles.forEach(bundle => bundle.destroy());
        this.bundles.length = 0;
        this._elementsMap.clear();
        this._needUpdateRenderBundles = true;
    }

    /**
     * 清除所有bundle的命中率
     */
    clearShot() {
        this.bundles.forEach(bundle => bundle.clearShotNum());
    }

    /**
     * 移除命中率低的bundle
     */
    removeLowShotBundle() {
        let remove = false;
        const bundles = this.bundles;
        for (let i = bundles.length - 1; i > -1; i--) {
            if (bundles[i].getShotRate() < this.lowShotRate) {
                bundles[i].removeMyIds(this._elementsMap);
                bundles.splice(i, 1);
                remove = true;
                //console.log('removeLowShotBundle =', i);
            }
        }
        if (remove)
            this._needUpdateRenderBundles = true;
        return remove;
    }

    /**
     * 销毁
     */
    destroy() {
        this.clearBundle();
    }
}