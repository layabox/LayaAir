import { WebGPURenderContext3D } from "../../3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundle } from "./WebGPURenderBundle";

/**
 * 渲染指令缓存管理器
 */
export class WebGPURenderBundleManager {
    elementsMaxPerBundleStatic: number = 100; //每个Bundle最大元素数量（静态节点）
    elementsMaxPerBundleDynamic: number = 30; //每个Bundle最大元素数量（动态节点）
    bundles: WebGPURenderBundle[] = []; //所有渲染指令缓存对象
    private _elementsMap: Map<number, WebGPURenderBundle> = new Map(); //所有渲染节点id集合
    private _renderBundles: GPURenderBundle[] = []; //提交的渲染命令缓存对象
    private _needUpdateRenderBundles: boolean = false; //是否需要更新渲染命令缓存对象

    /**
     * 提交缓存渲染命令
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
        //console.log('renderBundle =', rbs.length);
    }

    /**
     * 渲染元素是否在缓存中
     * @param elementId 
     */
    has(elementId: number) {
        const bundle = this._elementsMap.get(elementId);
        if (bundle) {
            bundle.addShot(); //命中
            return true;
        }
        return false; //未命中
    }

    /**
     * 根据渲染元素id查找渲染缓存对象
     * @param elementId 
     */
    getBundle(elementId: number) {
        for (let i = this.bundles.length - 1; i > -1; i--)
            if (this.bundles[i].hasElement(elementId))
                return this.bundles[i]; //命中
        return null; //未命中
    }

    /**
     * 通过渲染元素组创建渲染缓存对象
     * @param context 
     * @param elements 
     * @param shotRateSet 
     */
    createBundle(context: WebGPURenderContext3D, elements: WebGPURenderElement3D[], shotRateSet: number) {
        const bundle = new WebGPURenderBundle(context.device, context.destRT, shotRateSet);
        for (let i = 0, len = elements.length; i < len; i++) {
            bundle.render(context, elements[i]);
            this._elementsMap.set(elements[i].bundleId, bundle);
        }
        bundle.finish();
        this.bundles.push(bundle);
        this._needUpdateRenderBundles = true;
        //console.log('createBundle =', this.bundles.length - 1);
    }

    /**
     * 移除渲染缓存对象
     * @param bundle 
     */
    removeBundle(bundle: WebGPURenderBundle) {
        if (bundle) {
            const idx = this.bundles.indexOf(bundle);
            if (idx !== -1) {
                this.bundles[idx].removeMyIds(this._elementsMap);
                this.bundles.splice(idx, 1);
                this._needUpdateRenderBundles = true;
                //console.log('removeBundle =', idx);
            }
        }
    }

    /**
     * 通过指定元素id移除渲染缓存对象
     * @param elementId 
     */
    removeBundleByElement(elementId: number) {
        this.removeBundle(this.getBundle(elementId));
    }

    /**
     * 清除所有渲染缓存对象
     */
    clearBundle() {
        this.bundles.forEach(bundle => bundle.destroy());
        this.bundles.length = 0;
        this._elementsMap.clear();
        this._needUpdateRenderBundles = true;
    }

    /**
     * 清除所有渲染缓存对象的命中计数
     */
    clearShot() {
        this.bundles.forEach(bundle => bundle.clearShotNum());
    }

    /**
     * 移除命中率低的渲染缓存对象
     */
    removeLowShotBundle() {
        let remove = false;
        const bundles = this.bundles;
        for (let i = bundles.length - 1; i > -1; i--) {
            if (bundles[i].isLowShotRate()) {
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