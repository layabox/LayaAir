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

    /**
     * 渲染所有bundle
     * @param passEncoder 
     */
    renderBundles(passEncoder: GPURenderPassEncoder) {
        const bundles = [];
        for (let i = 0, len = this.bundles.length; i < len; i++)
            bundles.push(this.bundles[i].renderBundle);
        passEncoder.executeBundles(bundles);
        //console.log('renderBundle =', bundles.length);
    }

    /**
     * 根据渲染元素id查找bundle
     * @param elementId 
     */
    getBundle(elementId: number) {
        for (let i = this.bundles.length - 1; i > -1; i--)
            if (this.bundles[i].hasElement(elementId))
                return this.bundles[i];
        return null;
    }

    /**
     * 通过渲染元素组创建bundle
     * @param context 
     * @param elements 
     */
    createBundle(context: WebGPURenderContext3D, elements: WebGPURenderElement3D[]) {
        const bundle = new WebGPURenderBundle(context.device, context.destRT);
        for (let i = 0, len = elements.length; i < len; i++)
            bundle.render(context, elements[i]);
        bundle.finish();
        this.bundles.push(bundle);
        //console.log('createBundle =', this.bundles.length - 1, bundle);
    }

    /**
     * 移除bundle
     * @param bundle 
     */
    removeBundle(bundle: WebGPURenderBundle) {
        const idx = this.bundles.indexOf(bundle);
        if (idx !== -1)
            this.bundles.splice(idx, 1);
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
                bundles.splice(i, 1);
                remove = true;
                //console.log('removeLowShotBundle =', i);
            }
        }
        return remove;
    }

    /**
     * 销毁
     */
    destroy() {
        this.bundles.forEach(bundle => bundle.destroy());
        this.bundles.length = 0;
    }
}